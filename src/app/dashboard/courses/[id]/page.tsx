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

const coursesCurriculums: Record<string, { title: string; modules: Module[] }> = {
  "mern-freelancing": {
    title: "MERN Stack Development for Freelancing",
    modules: [
      {
        title: "Module 1: Getting Started",
        lessons: [
          { id: "mern-1", title: "Course Introduction & Setup", duration: "10:24", completed: true },
          { id: "mern-2", title: "Understanding Client-Server Model", duration: "15:45", completed: true },
        ]
      },
      {
        title: "Module 2: Frontend with React",
        lessons: [
          { id: "mern-3", title: "React State & Props Masterclass", duration: "25:30", completed: true },
          { id: "mern-4", title: "Integrating Tailwind CSS v4", duration: "18:15", completed: false },
          { id: "mern-5", title: "Fetching APIs with Axios", duration: "22:50", completed: false },
        ]
      },
      {
        title: "Module 3: Backend with Node & Mongo",
        lessons: [
          { id: "mern-6", title: "Creating Express Router API", duration: "32:10", completed: false },
          { id: "mern-7", title: "Mongoose Models & Schemas", duration: "24:45", completed: false },
        ]
      }
    ]
  },
  "figma-uiux": {
    title: "Figma UI/UX Design Boot Camp",
    modules: [
      {
        title: "Module 1: Design Principles",
        lessons: [
          { id: "fig-1", title: "UX Research Basics", duration: "12:15", completed: true },
          { id: "fig-2", title: "Understanding Visual Hierarchy", duration: "18:40", completed: true },
        ]
      },
      {
        title: "Module 2: Designing in Figma",
        lessons: [
          { id: "fig-3", title: "Figma Frames, Shapes & Pen Tool", duration: "28:10", completed: false },
          { id: "fig-4", title: "Auto Layout 5.0 Core Principles", duration: "35:50", completed: false },
          { id: "fig-5", title: "Building Responsive Dashboards", duration: "42:30", completed: false },
        ]
      }
    ]
  }
};

export default function CoursePlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const courseData = coursesCurriculums[id] || coursesCurriculums["mern-freelancing"];

  // States
  const [modules, setModules] = useState<Module[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<"notes" | "resources">("notes");
  const [notesText, setNotesText] = useState("");
  const [isNoteSaved, setIsNoteSaved] = useState(false);

  // Initialize data
  useEffect(() => {
    if (courseData) {
      setTimeout(() => {
        setModules(courseData.modules);
        // Select first uncompleted lesson or default to first lesson
        let firstLesson: Lesson | null = null;
        for (const mod of courseData.modules) {
          for (const les of mod.lessons) {
            if (!les.completed && !firstLesson) {
              firstLesson = les;
            }
          }
        }
        if (!firstLesson && courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
          firstLesson = courseData.modules[0].lessons[0];
        }
        setActiveLesson(firstLesson);

        // Load saved notes from localStorage
        const savedNote = localStorage.getItem(`note-${id}`);
        if (savedNote) setNotesText(savedNote);
      }, 0);
    }
  }, [id, courseData]);

  // Calculations
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsCount = modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  const handleToggleLessonComplete = (lessonId: string) => {
    const updated = modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((les) => {
        if (les.id === lessonId) {
          const nextCompletedState = !les.completed;
          // If toggled active lesson, sync it
          if (activeLesson?.id === lessonId) {
            setActiveLesson({ ...activeLesson, completed: nextCompletedState });
          }
          return { ...les, completed: nextCompletedState };
        }
        return les;
      })
    }));
    setModules(updated);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`note-${id}`, notesText);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 3000);
  };

  if (!activeLesson) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Top navbar links */}
      <div className="text-xs text-muted-foreground flex items-center justify-between">
        <div>
          <Link href="/dashboard/courses" className="hover:text-primary transition-colors">← Back to Courses</Link>
        </div>
        <div className="font-semibold text-foreground">{courseData.title}</div>
      </div>

      {/* Main Player Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player and Tabs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Simulated Video Player */}
          <div className="aspect-video w-full rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between p-6 relative overflow-hidden shadow-2xl">
            {/* Ambient background glow inside player */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

            {/* Video Header */}
            <div className="flex justify-between items-center z-10 text-zinc-300">
              <span className="text-[10px] uppercase font-bold bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-primary">
                Active Lesson
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">{activeLesson.duration}</span>
            </div>

            {/* Play Button Center Overlay */}
            <div className="flex justify-center items-center z-10">
              <button
                onClick={() => alert(`Simulating playback for: ${activeLesson.title}`)}
                className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg hover:scale-105 hover:bg-primary transition-all active:scale-95"
              >
                <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            {/* Video Footer Controls */}
            <div className="space-y-3 z-10">
              <p className="text-sm font-bold text-zinc-100">{activeLesson.title}</p>
              
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <button className="hover:text-zinc-100 transition-colors">⏸</button>
                <div className="flex-1 bg-zinc-800 rounded-full h-1 cursor-pointer overflow-hidden">
                  <div className="bg-primary h-full w-1/3 rounded-full" />
                </div>
                <span className="text-[10px] text-zinc-500">03:45 / {activeLesson.duration}</span>
                <span className="hover:text-zinc-100 cursor-pointer">🔊</span>
                <span className="hover:text-zinc-100 cursor-pointer">⚙️</span>
              </div>
            </div>
          </div>

          {/* Lower Tabs (Notes and Resources) */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex border-b border-border mb-4">
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-2 text-xs font-bold border-b-2 px-4 transition-all ${
                  activeTab === "notes"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Personal Notes
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`pb-2 text-xs font-bold border-b-2 px-4 transition-all ${
                  activeTab === "resources"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Resources & Downloads
              </button>
            </div>

            {/* Notes content */}
            {activeTab === "notes" && (
              <div className="space-y-3 animate-fade-in">
                {isNoteSaved && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-semibold text-center">
                    ✓ Notes saved to browser storage.
                  </div>
                )}
                <textarea
                  rows={4}
                  placeholder="Write your notes for this lesson here..."
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
                <div className="text-right">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 h-9 bg-primary text-primary-foreground font-bold text-xs rounded-md hover:bg-primary/95 transition-all shadow-md"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            )}

            {/* Resources content */}
            {activeTab === "resources" && (
              <ul className="space-y-2 animate-fade-in pl-4 list-disc text-xs text-muted-foreground">
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

        {/* Right Column: Lessons Curriculum Checklist */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-black tracking-wider text-muted-foreground uppercase">Course Progress</h2>
            <div className="flex justify-between items-baseline text-xs font-bold text-foreground">
              <span>{completedLessonsCount} of {totalLessons} completed</span>
              <span className="text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Module list */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wide">Course Lessons</h3>
            <div className="space-y-4">
              {modules.map((mod, mIdx) => (
                <div key={mIdx} className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground opacity-90">{mod.title}</h4>
                  <div className="space-y-1.5">
                    {mod.lessons.map((les) => {
                      const isActive = les.id === activeLesson.id;
                      return (
                        <div
                          key={les.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                            isActive
                              ? "border-primary bg-primary/5 font-bold text-foreground"
                              : "border-border/40 hover:border-border text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={les.completed}
                              onChange={() => handleToggleLessonComplete(les.id)}
                              className="rounded border-input text-primary focus:ring-primary accent-primary cursor-pointer h-3.5 w-3.5 shrink-0"
                            />
                            <button
                              onClick={() => handleSelectLesson(les)}
                              className="text-left truncate hover:text-primary transition-colors text-[11px]"
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
  );
}
