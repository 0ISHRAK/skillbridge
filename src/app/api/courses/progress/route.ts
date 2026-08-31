import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticate, safeJsonParse } from "@/lib/auth";
import { awardLearningTokens } from "@/lib/rewards";

export async function GET(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: decoded.userId, courseId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found / You are not enrolled" },
        { status: 404 }
      );
    }

    const completed = safeJsonParse<string[]>(enrollment.completedLessons, []);

    return NextResponse.json({ completed, progress: enrollment.progress });
  } catch (err) {
    console.error("GET Progress error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await authenticate();
    if (!decoded) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const { courseId, lessonId, completed, lessonTitle } = await request.json();

    if (!courseId || !lessonId || completed === undefined) {
      return NextResponse.json(
        { error: "courseId, lessonId, and completed status are required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment record not found" },
        { status: 404 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const parsedLessons = safeJsonParse<Array<{ id?: string; title?: string }>>(course.lessons, []);
    const validLessonIds = parsedLessons.map((l) => l.id).filter(Boolean);

    let completedList: string[] = safeJsonParse<string[]>(enrollment.completedLessons, []);

    const isNewlyCompleted = completed && !completedList.includes(lessonId);

    if (completed) {
      if (!completedList.includes(lessonId)) {
        completedList.push(lessonId);
      }
    } else {
      completedList = completedList.filter((id) => id !== lessonId);
    }

    const totalLessons = Math.max(parsedLessons.length, validLessonIds.length, 1);
    const progressPercent = Math.min(100, Math.round((completedList.length / totalLessons) * 100));

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedLessons: JSON.stringify(completedList),
        progress: progressPercent,
      },
    });

    let tokensEarned = 0;
    const rewardBreakdown: Array<{ type: string; amount: number; description: string }> = [];

    // Reward logic triggers only when a lesson is marked completed for the first time
    if (isNewlyCompleted) {
      // 1. Reward: Complete a lesson -> +5 tokens
      const lessonReward = await awardLearningTokens({
        userId,
        amount: 5,
        type: "lesson_complete",
        title: "Lesson Completed",
        description: `Completed lesson "${lessonTitle || lessonId}" in "${course.title}"`,
        referenceId: lessonId,
      });

      if (lessonReward.awarded) {
        tokensEarned += 5;
        rewardBreakdown.push({
          type: "lesson_complete",
          amount: 5,
          description: "Lesson completion (+5 tokens)",
        });
      }

      // 2. Check Milestones across all user enrollments
      const allEnrollments = await prisma.enrollment.findMany({
        where: { userId },
      });
      const totalCompletedLessonsAllCourses = allEnrollments.reduce((acc, curr) => {
        const list = safeJsonParse<string[]>(curr.completedLessons, []);
        return acc + list.length;
      }, 0);

      // Milestone: First Lesson Ever Completed -> +15 tokens
      if (totalCompletedLessonsAllCourses === 1) {
        const firstLessonMilestone = await awardLearningTokens({
          userId,
          amount: 15,
          type: "milestone_complete",
          title: "Milestone: First Lesson Completed!",
          description: "Congratulations on taking your first learning step with Skillbridge!",
          referenceId: "milestone_first_lesson",
        });
        if (firstLessonMilestone.awarded) {
          tokensEarned += 15;
          rewardBreakdown.push({
            type: "milestone_complete",
            amount: 15,
            description: "Milestone: First Lesson Completed (+15 tokens)",
          });
        }
      }

      // Milestone: 5 Lessons Completed -> +20 tokens
      if (totalCompletedLessonsAllCourses >= 5) {
        const fiveLessonsMilestone = await awardLearningTokens({
          userId,
          amount: 20,
          type: "milestone_complete",
          title: "Milestone: 5 Lessons Mastered!",
          description: "You've successfully finished 5 learning lessons!",
          referenceId: "milestone_5_lessons",
        });
        if (fiveLessonsMilestone.awarded) {
          tokensEarned += 20;
          rewardBreakdown.push({
            type: "milestone_complete",
            amount: 20,
            description: "Milestone: 5 Lessons Mastered (+20 tokens)",
          });
        }
      }

      // 3. Reward: Complete a course -> +50 tokens (when progress reaches 100%)
      if (progressPercent === 100) {
        const courseReward = await awardLearningTokens({
          userId,
          amount: 50,
          type: "course_complete",
          title: "Course Completed",
          description: `Finished 100% of "${course.title}"`,
          referenceId: courseId,
        });

        if (courseReward.awarded) {
          tokensEarned += 50;
          rewardBreakdown.push({
            type: "course_complete",
            amount: 50,
            description: "Course Completion (+50 tokens)",
          });

          // 4. Bonus: Complete a course with excellent performance -> +25 bonus tokens
          // (Check if user has quiz attempts for this course with average score >= 90%)
          const quizAttempts = await prisma.quizAttempt.findMany({
            where: { userId, courseId },
          });

          const passedAttempts = quizAttempts.filter((q) => q.passed);
          const averageScore =
            passedAttempts.length > 0
              ? passedAttempts.reduce((acc, q) => acc + q.score, 0) / passedAttempts.length
              : 0;

          if (averageScore >= 90 || passedAttempts.length >= 2) {
            const courseExcellenceBonus = await awardLearningTokens({
              userId,
              amount: 25,
              type: "course_bonus",
              title: "Course Excellence Performance Bonus",
              description: `Completed "${course.title}" with superior assessment scores (>=90%)`,
              referenceId: courseId,
            });

            if (courseExcellenceBonus.awarded) {
              tokensEarned += 25;
              rewardBreakdown.push({
                type: "course_bonus",
                amount: 25,
                description: "Course Excellence Bonus (+25 tokens)",
              });
            }
          }
        }
      }
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenBalance: true },
    });

    return NextResponse.json({
      message: "Lesson status updated successfully",
      completed: completedList,
      progressPercent,
      tokensEarned,
      rewardBreakdown,
      isCourseCompleted: progressPercent === 100,
      newBalance: userProfile?.tokenBalance ?? 0,
    });
  } catch (err) {
    console.error("POST Progress error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
