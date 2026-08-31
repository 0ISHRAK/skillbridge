"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

interface QuizResultItem {
  id: string;
  question: string;
  selectedIndex?: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

interface QuizData {
  quizId: string;
  lessonId: string;
  title: string;
  passingPercentage: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  hasPassed: boolean;
  highestScore: number;
  rewardStatus: {
    passRewardClaimed: boolean;
    bonusRewardClaimed: boolean;
  };
}

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // States
  const [courseTitle, setCourseTitle] = useState("Course Curriculum");
  const [modules, setModules] = useState<Module[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "resources" | "quiz">("notes");
  const [notesText, setNotesText] = useState("");
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [userName, setUserName] = useState("SkillBridge Scholar");
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState<boolean>(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState<boolean>(false);
  const [quizSubmissionResult, setQuizSubmissionResult] = useState<{
    score: number;
    passed: boolean;
    tokensEarned: number;
    results: QuizResultItem[];
    message: string;
  } | null>(null);

  // Reward toast / banner
  const [rewardToast, setRewardToast] = useState<{
    title: string;
    amount: number;
    description: string;
  } | null>(null);

  // Course Completion modal
  const [courseCompleteModal, setCourseCompleteModal] = useState<{
    totalEarned: number;
    hasExcellenceBonus: boolean;
  } | null>(null);

  // 1. Fetch course details and user progress
  useEffect(() => {
    async function loadCourseAndProgress() {
      try {
        const [courseRes, progressRes, meRes] = await Promise.all([
          fetch(`/api/courses/${id}`).catch(() => null),
          fetch(`/api/courses/progress?courseId=${id}`).catch(() => null),
          fetch("/api/auth/me").catch(() => null),
        ]);

        let completedIds: string[] = [];
        if (progressRes && progressRes.ok) {
          const pData = await progressRes.json();
          completedIds = pData.completed || [];
        }

        if (meRes && meRes.ok) {
          const meData = await meRes.json();
          if (meData.user?.tokenBalance !== undefined) {
            setTokenBalance(meData.user.tokenBalance);
          }
          if (meData.user?.name) {
            setUserName(meData.user.name);
          }
        }

        if (courseRes && courseRes.ok) {
          const data = await courseRes.json();
          const course = data.course;
          setCourseTitle(course.title || "Course Player");

          const rawLessons = Array.isArray(course.lessons) ? course.lessons : [];
          if (rawLessons.length > 0) {
            const formattedLessons: Lesson[] = rawLessons.map((l: { id?: string; title?: string; duration?: string }, idx: number) => ({
              id: l.id || `les-${idx + 1}`,
              title: l.title || `Lesson ${idx + 1}`,
              duration: l.duration || "15:00",
              completed: completedIds.includes(l.id || `les-${idx + 1}`),
            }));

            // Group into modules of 3-4 lessons each
            const groupedModules: Module[] = [];
            const chunkSize = 3;
            for (let i = 0; i < formattedLessons.length; i += chunkSize) {
              const chunk = formattedLessons.slice(i, i + chunkSize);
              groupedModules.push({
                title: `Module ${Math.floor(i / chunkSize) + 1}: Key Principles & Implementation`,
                lessons: chunk,
              });
            }

            setModules(groupedModules);
            setActiveLesson(formattedLessons.find((l) => !l.completed) || formattedLessons[0]);
            return;
          }
        }

        // Fallback default curriculum if course has no lessons in database
        const fallbackModules: Module[] = [
          {
            title: "Module 1: Getting Started & Foundations",
            lessons: [
              { id: "mern-1", title: "Course Introduction & Setup", duration: "10:24", completed: completedIds.includes("mern-1") },
              { id: "mern-2", title: "Understanding Client-Server Model", duration: "15:45", completed: completedIds.includes("mern-2") },
            ],
          },
          {
            title: "Module 2: Core Engineering Concepts",
            lessons: [
              { id: "mern-3", title: "React State & Props Masterclass", duration: "25:30", completed: completedIds.includes("mern-3") },
              { id: "fig-1", title: "UX Research Basics & Architecture", duration: "18:15", completed: completedIds.includes("fig-1") },
            ],
          },
        ];
        setModules(fallbackModules);
        setActiveLesson(fallbackModules[0].lessons[0]);
        const savedNote = localStorage.getItem(`note-${id}`);
        if (savedNote) setNotesText(savedNote);
      } catch (err) {
        console.error("Error loading course player:", err);
      }
    }

    void loadCourseAndProgress();
  }, [id]);

  // 2. Fetch Quiz when activeLesson or tab changes
  useEffect(() => {
    let isMounted = true;
    if (activeLesson && activeTab === "quiz") {
      const loadQuiz = async () => {
        setQuizLoading(true);
        setQuizSubmissionResult(null);
        setSelectedAnswers({});
        try {
          const res = await fetch(`/api/courses/quiz?lessonId=${activeLesson.id}&courseId=${id}&lessonTitle=${encodeURIComponent(activeLesson.title)}`);
          if (res.ok && isMounted) {
            const data = await res.json();
            if (data) setQuizData(data);
          }
        } catch {
          // Ignore
        } finally {
          if (isMounted) setQuizLoading(false);
        }
      };
      void loadQuiz();
    }
    return () => {
      isMounted = false;
    };
  }, [activeLesson, activeTab, id]);

  // Calculations
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsCount = modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // Toggle Lesson Complete & Award Tokens
  const handleToggleLessonComplete = async (lessonId: string, currentStatus: boolean, title: string) => {
    const nextCompleted = !currentStatus;

    // Optimistic UI update
    const updated = modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((les) => {
        if (les.id === lessonId) {
          if (activeLesson?.id === lessonId) {
            setActiveLesson({ ...activeLesson, completed: nextCompleted });
          }
          return { ...les, completed: nextCompleted };
        }
        return les;
      }),
    }));
    setModules(updated);

    try {
      const res = await fetch("/api/courses/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: id,
          lessonId,
          lessonTitle: title,
          completed: nextCompleted,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tokensEarned > 0) {
          setTokenBalance(data.newBalance);
          localStorage.setItem("tokenBalance", String(data.newBalance));

          setRewardToast({
            title: `+${data.tokensEarned} Tokens Earned! 🪙`,
            amount: data.tokensEarned,
            description: data.rewardBreakdown?.map((r: { description: string }) => r.description).join(" · ") || "Great job completing your learning goal!",
          });
          setTimeout(() => setRewardToast(null), 5000);
        }

        if (data.isCourseCompleted) {
          setCourseCompleteModal({
            totalEarned: data.tokensEarned,
            hasExcellenceBonus: data.rewardBreakdown?.some((r: { type: string }) => r.type === "course_bonus"),
          });
        }
      }
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData || !activeLesson) return;
    setSubmittingQuiz(true);

    try {
      const res = await fetch("/api/courses/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: id,
          lessonId: activeLesson.id,
          lessonTitle: activeLesson.title,
          answers: selectedAnswers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setQuizSubmissionResult(data);
        if (data.tokensEarned > 0) {
          setTokenBalance(data.newBalance);
          localStorage.setItem("tokenBalance", String(data.newBalance));

          setRewardToast({
            title: `+${data.tokensEarned} Quiz Tokens Earned! 🪙`,
            amount: data.tokensEarned,
            description: data.rewardBreakdown?.map((r: { description: string }) => r.description).join(" · ") || "Awesome score on your knowledge assessment!",
          });
          setTimeout(() => setRewardToast(null), 5000);
        }
      }
    } catch (err) {
      console.error("Quiz submission error:", err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`note-${id}`, notesText);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 3000);
  };

  if (!activeLesson) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground">Loading curriculum and lessons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-up relative">
      {/* ─── FLOATING REWARD NOTIFICATION TOAST ─── */}
      {rewardToast && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-card border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 flex items-center gap-4 animate-scale-up max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shrink-0">
            🪙
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-amber-500">{rewardToast.title}</p>
            <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{rewardToast.description}</p>
          </div>
          <button
            onClick={() => setRewardToast(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top navbar links */}
      <div className="text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Link href="/dashboard/courses" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold">
            <span>←</span> Back to Enrolled Courses
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/rewards"
            className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/20 transition-all"
          >
            <span>🪙 {tokenBalance} Tokens</span>
            <span className="text-[10px] underline">Rewards Store →</span>
          </Link>
          <div className="font-semibold text-foreground truncate max-w-xs">{courseTitle}</div>
        </div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player and Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Simulated Video Player */}
          <div className="aspect-video w-full rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary/20 rounded-full blur-[110px] pointer-events-none" />

            <div className="flex justify-between items-center z-10 text-zinc-300">
              <span className="text-[10px] uppercase font-bold bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg text-primary flex items-center gap-1.5">
                <span>▶</span> Active Lesson
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">{activeLesson.duration}</span>
            </div>

            {/* Play Button Center Overlay */}
            <div className="flex flex-col justify-center items-center z-10 space-y-3">
              <button
                onClick={() => alert(`Simulating playback for: ${activeLesson.title}`)}
                className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-2xl hover:scale-110 hover:bg-primary/95 transition-all active:scale-95"
              >
                <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <p className="text-xs text-zinc-400 font-medium">Interactive Learning Session</p>
            </div>

            {/* Video Footer Controls */}
            <div className="space-y-3 z-10">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-zinc-100 truncate">{activeLesson.title}</p>
                <button
                  onClick={() => handleToggleLessonComplete(activeLesson.id, activeLesson.completed, activeLesson.title)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeLesson.completed
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  <span>{activeLesson.completed ? "✓ Completed (+10 Tokens)" : "Mark as Complete"}</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <div className="flex-1 bg-zinc-800 rounded-full h-1.5 cursor-pointer overflow-hidden">
                  <div className="bg-primary h-full w-1/3 rounded-full" />
                </div>
                <span className="text-[10px] text-zinc-500">03:45 / {activeLesson.duration}</span>
              </div>
            </div>
          </div>

          {/* Lower Tabs (Quiz, Notes, Resources) */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex border-b border-border gap-2">
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-3 text-xs font-bold border-b-2 px-3 transition-all ${
                  activeTab === "notes"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                📝 Personal Notes
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`pb-3 text-xs font-bold border-b-2 px-3 transition-all flex items-center gap-1.5 ${
                  activeTab === "quiz"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>🎯 Lesson Quiz</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/10 text-amber-500 font-extrabold border border-amber-500/20">
                  +20 Tokens
                </span>
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`pb-3 text-xs font-bold border-b-2 px-3 transition-all ${
                  activeTab === "resources"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                📁 Resources & Downloads
              </button>
            </div>

            {/* TAB 1: NOTES */}
            {activeTab === "notes" && (
              <div className="space-y-4 animate-fade-in">
                {isNoteSaved && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold text-center">
                    ✓ Notes saved to browser storage.
                  </div>
                )}
                <textarea
                  rows={4}
                  placeholder="Write your personal study notes for this lesson here..."
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <div className="text-right">
                  <button
                    onClick={handleSaveNotes}
                    className="px-5 h-9 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LESSON QUIZ */}
            {activeTab === "quiz" && (
              <div className="space-y-6 animate-fade-in">
                {quizLoading ? (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-muted-foreground">Loading lesson assessment...</p>
                  </div>
                ) : !quizData ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Unable to load quiz. Please try again.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-2xl bg-muted/40 border border-border">
                      <div>
                        <h3 className="font-extrabold text-sm text-foreground">{quizData.title}</h3>
                        <p className="text-[11px] text-muted-foreground">
                          Pass mark: {quizData.passingPercentage}% · Passing awards <strong>+20 Tokens</strong> · Score ≥90% awards <strong>+10 Mastery Bonus</strong>
                        </p>
                      </div>
                      {quizData.rewardStatus.passRewardClaimed && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          ✓ Reward Claimed
                        </span>
                      )}
                    </div>

                    {/* Quiz Submission Result Display */}
                    {quizSubmissionResult && (
                      <div className={`p-5 rounded-2xl border ${
                        quizSubmissionResult.passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                      } space-y-3`}>
                        <div className="flex items-center justify-between">
                          <p className="text-base font-black">
                            {quizSubmissionResult.passed ? "🎉 Quiz Passed!" : "Needs Improvement"}
                          </p>
                          <span className="text-lg font-black">{quizSubmissionResult.score}%</span>
                        </div>
                        <p className="text-xs text-foreground/90">{quizSubmissionResult.message}</p>
                      </div>
                    )}

                    {/* Questions */}
                    <div className="space-y-6">
                      {quizData.questions.map((q, qIdx) => {
                        const submittedResult = quizSubmissionResult?.results.find((r) => r.id === q.id);

                        return (
                          <div key={q.id} className="p-5 rounded-2xl border border-border bg-background space-y-4">
                            <p className="text-xs font-bold text-foreground">
                              <span className="text-primary font-black mr-2">Q{qIdx + 1}.</span>
                              {q.question}
                            </p>

                            <div className="space-y-2">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = selectedAnswers[q.id] === oIdx;
                                const isCorrectAnswer = submittedResult && submittedResult.correctIndex === oIdx;
                                const isWrongSelection = submittedResult && isSelected && !submittedResult.isCorrect;

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    onClick={() => handleSelectAnswer(q.id, oIdx)}
                                    disabled={submittingQuiz || (quizSubmissionResult?.passed ?? false)}
                                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                                      isCorrectAnswer
                                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-500 font-bold"
                                        : isWrongSelection
                                        ? "bg-rose-500/15 border-rose-500 text-rose-500 font-bold"
                                        : isSelected
                                        ? "bg-primary/10 border-primary text-primary font-bold"
                                        : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {isCorrectAnswer && <span>✓ Correct</span>}
                                    {isWrongSelection && <span>✗ Incorrect</span>}
                                  </button>
                                );
                              })}
                            </div>

                            {submittedResult && (
                              <p className="text-[11px] text-muted-foreground p-3 rounded-lg bg-muted/40 border border-border/60">
                                <strong>Explanation:</strong> {submittedResult.explanation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={
                          submittingQuiz ||
                          Object.keys(selectedAnswers).length < quizData.questions.length
                        }
                        className="px-6 h-11 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingQuiz ? "Evaluating Answers..." : "Submit Quiz & Claim Tokens →"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RESOURCES */}
            {activeTab === "resources" && (
              <ul className="space-y-3 animate-fade-in pl-4 list-disc text-xs text-muted-foreground">
                <li>
                  <a href="#" className="text-primary hover:underline font-semibold" onClick={(e) => { e.preventDefault(); alert("Simulating download..."); }}>
                    Module Slide deck (PDF)
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline font-semibold" onClick={(e) => { e.preventDefault(); alert("Simulating download..."); }}>
                    Source Code GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline font-semibold" onClick={(e) => { e.preventDefault(); alert("Simulating download..."); }}>
                    Cheatsheet PDF Reference
                  </a>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: Curriculum Checklist & Rewards Progress */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black tracking-wider text-muted-foreground uppercase">Course Progress</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary border border-primary/20">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                {completedLessonsCount} of {totalLessons} lessons finished
              </p>

              {progressPercent === 100 && (
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="w-full py-2.5 rounded-xl bg-linear-to-r from-amber-500 via-primary to-amber-500 text-primary-foreground font-black text-xs hover:opacity-95 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse-subtle"
                >
                  <span>📜</span> View Official Certificate
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                <span className="flex items-center gap-1.5">
                  <span>🪙</span> Course Rewards
                </span>
                <span>+100 to +150 Tokens</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Finish all lessons for <strong>+100 Tokens</strong>, and pass quizzes with ≥90% for a <strong>+50 Excellence Bonus</strong>!
              </p>
            </div>

            <hr className="border-border/60" />

            {/* Module list */}
            <div className="space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Curriculum</h3>
              <div className="space-y-5">
                {modules.map((mod, mIdx) => (
                  <div key={mIdx} className="space-y-2.5">
                    <h4 className="text-xs font-bold text-foreground">{mod.title}</h4>
                    <div className="space-y-2">
                      {mod.lessons.map((les) => {
                        const isActive = les.id === activeLesson?.id;
                        return (
                          <div
                            key={les.id}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                              isActive
                                ? "border-primary bg-primary/5 font-bold text-foreground shadow-sm"
                                : "border-border hover:border-primary/30 text-muted-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={les.completed}
                                onChange={() => handleToggleLessonComplete(les.id, les.completed, les.title)}
                                className="rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer h-4 w-4 shrink-0"
                              />
                              <button
                                onClick={() => setActiveLesson(les)}
                                className="text-left truncate hover:text-primary transition-colors text-xs"
                              >
                                {les.title}
                              </button>
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{les.duration}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── COURSE COMPLETION CELEBRATION MODAL ─── */}
      {courseCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-card border-2 border-primary/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-amber-500/20 to-primary/20 border-2 border-amber-500/40 text-4xl flex items-center justify-center mx-auto animate-bounce">
              🎓
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-foreground">Course Completed!</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Congratulations on finishing 100% of <strong>{courseTitle}</strong>!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <p className="text-xs uppercase font-bold text-amber-500 tracking-wider">Rewards Granted</p>
              <p className="text-2xl font-black text-amber-500 flex items-center justify-center gap-2">
                <span>🪙</span> +{courseCompleteModal.totalEarned || 100} Tokens
              </p>
              {courseCompleteModal.hasExcellenceBonus && (
                <p className="text-[11px] font-bold text-emerald-500">
                  Includes +50 Course Excellence Bonus! 🌟
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCourseCompleteModal(null);
                  setShowCertificateModal(true);
                }}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-xs font-black hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📜</span> View Certificate
              </button>
              <button
                onClick={() => setCourseCompleteModal(null)}
                className="flex-1 h-11 rounded-xl border border-border hover:bg-accent text-foreground text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── OFFICIAL VERIFIED CERTIFICATE MODAL ─── */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border-4 border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden animate-scale-up text-center my-8">
            <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-amber-500 via-primary to-amber-500" />
            
            <div className="flex justify-between items-start">
              <div className="text-left space-y-0.5">
                <span className="text-xl font-black text-primary tracking-tight">SKILLBRIDGE</span>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">
                  Academic Credential Registry
                </p>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-2 space-y-1">
              <span className="text-4xl block">🎓</span>
              <h2 className="text-xs uppercase tracking-widest font-black text-amber-500">
                Certificate of Completion & Mastery
              </h2>
              <p className="text-[11px] text-muted-foreground">This is proudly awarded to</p>
              <h3 className="text-2xl font-black text-foreground pt-1 tracking-tight border-b-2 border-primary/30 inline-block px-6 pb-1">
                {userName}
              </h3>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed max-w-lg mx-auto">
              for successfully fulfilling all curriculum requirements, passing knowledge assessments, and demonstrating practical excellence in
            </p>

            <div className="p-3 bg-muted/40 border border-border/80 rounded-2xl max-w-md mx-auto">
              <p className="text-base font-black text-primary">{courseTitle}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">100% Practical Course Completion</p>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-3 gap-3 text-left p-4 rounded-xl bg-background/80 border border-border text-[10px]">
              <div>
                <span className="text-muted-foreground font-semibold block">Credential ID:</span>
                <span className="font-mono font-bold text-foreground">#SB-CERT-{id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block">Issue Date:</span>
                <span className="font-semibold text-foreground">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block">Verification Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Digitally Signed
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🖨️</span> Print / Save PDF Certificate
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-6 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs border border-border transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
