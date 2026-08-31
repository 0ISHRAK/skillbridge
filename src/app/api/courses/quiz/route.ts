import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticate } from "@/lib/auth";
import { getLessonQuiz, awardLearningTokens } from "@/lib/rewards";

export async function GET(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const lessonId = url.searchParams.get("lessonId");
    const courseId = url.searchParams.get("courseId");
    const lessonTitle = url.searchParams.get("lessonTitle") || undefined;

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
    }

    const quiz = getLessonQuiz(lessonId, lessonTitle);

    // Fetch previous attempts by user for this lesson
    const previousAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: user.userId,
        lessonId,
        ...(courseId ? { courseId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const hasPassed = previousAttempts.some((a) => a.passed);
    const highestScore = previousAttempts.reduce((max, a) => Math.max(max, a.score), 0);

    // Check if tokens were already awarded
    const [passTx, bonusTx] = await Promise.all([
      prisma.tokenTransaction.findFirst({
        where: { userId: user.userId, referenceId: lessonId, type: "quiz_pass" },
      }),
      prisma.tokenTransaction.findFirst({
        where: { userId: user.userId, referenceId: lessonId, type: "quiz_bonus" },
      }),
    ]);

    // Sanitize questions so correct answers are not exposed in client payload
    const clientQuestions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({
      quizId: quiz.quizId,
      lessonId: quiz.lessonId,
      title: quiz.title,
      passingPercentage: quiz.passingPercentage,
      totalQuestions: quiz.questions.length,
      questions: clientQuestions,
      previousAttempts: previousAttempts.map((a) => ({
        id: a.id,
        score: a.score,
        passed: a.passed,
        createdAt: a.createdAt,
      })),
      hasPassed,
      highestScore,
      rewardStatus: {
        passRewardClaimed: !!passTx,
        bonusRewardClaimed: !!bonusTx,
      },
    });
  } catch (err) {
    console.error("GET /api/courses/quiz error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, lessonId, lessonTitle, answers } = body;

    if (!lessonId || !answers || typeof answers !== "object") {
      return NextResponse.json({ error: "lessonId and answers object are required" }, { status: 400 });
    }

    const quiz = getLessonQuiz(lessonId, lessonTitle);
    const totalQuestions = quiz.questions.length;
    let correctAnswers = 0;

    const questionResults = quiz.questions.map((q) => {
      const selectedIndex = answers[q.id];
      const isCorrect = selectedIndex === q.correctIndex;
      if (isCorrect) correctAnswers += 1;

      return {
        id: q.id,
        question: q.question,
        selectedIndex,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingPercentage;

    let tokensEarned = 0;
    let bonusEarned = 0;
    const rewardBreakdown: Array<{ type: string; amount: number; description: string }> = [];

    // Award tokens if passed and not yet rewarded
    if (passed) {
      // 1. Base quiz pass reward (+10 tokens)
      const passResult = await awardLearningTokens({
        userId: user.userId,
        amount: 10,
        type: "quiz_pass",
        title: "Quiz Passed",
        description: `Passed quiz for "${quiz.title}" with score ${score}%`,
        referenceId: lessonId,
      });

      if (passResult.awarded) {
        tokensEarned += 10;
        rewardBreakdown.push({
          type: "quiz_pass",
          amount: 10,
          description: "Passed quiz (+10 tokens)",
        });
      }

      // 2. Quiz excellence bonus (+5 tokens for score >= 90%)
      if (score >= 90) {
        const bonusResult = await awardLearningTokens({
          userId: user.userId,
          amount: 5,
          type: "quiz_bonus",
          title: "Quiz Excellence Mastery Bonus",
          description: `Scored ${score}% (>=90%) on "${quiz.title}"`,
          referenceId: lessonId,
        });

        if (bonusResult.awarded) {
          bonusEarned += 5;
          tokensEarned += 5;
          rewardBreakdown.push({
            type: "quiz_bonus",
            amount: 5,
            description: "High Score Mastery Bonus (+5 tokens)",
          });
        }
      }
    }

    // Record quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.userId,
        courseId: courseId || "generic-course",
        lessonId,
        score,
        passed,
        totalQuestions,
        correctAnswers,
        tokensAwarded: tokensEarned,
      },
    });

    // Fetch updated user token balance
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { tokenBalance: true },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      results: questionResults,
      tokensEarned,
      bonusEarned,
      rewardBreakdown,
      newBalance: userProfile?.tokenBalance ?? 0,
      message: passed
        ? score >= 90
          ? `🎉 Outstanding! You scored ${score}% and earned ${tokensEarned} tokens including a mastery bonus!`
          : `✓ Great job! You passed with ${score}% and earned ${tokensEarned} tokens!`
        : `You scored ${score}%. You need ${quiz.passingPercentage}% to pass and earn rewards. Review the lesson and try again!`,
    });
  } catch (err) {
    console.error("POST /api/courses/quiz error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
