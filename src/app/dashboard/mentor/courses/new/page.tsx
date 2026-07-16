"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewLesson {
  id: string;
  title: string;
  duration: string;
}

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Software & Coding");
  const [price, setPrice] = useState(1500);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [lessons, setLessons] = useState<NewLesson[]>([
    { id: "lesson-1", title: "Introduction & Overview", duration: "12:00" },
  ]);
  const [lessonTitleInput, setLessonTitleInput] = useState("");
  const [lessonDurationInput, setLessonDurationInput] = useState("10:00");

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (lessonTitleInput.trim()) {
      setLessons([
        ...lessons,
        { id: `lesson-${Date.now()}`, title: lessonTitleInput, duration: lessonDurationInput },
      ]);
      setLessonTitleInput("");
      setLessonDurationInput("10:00");
    }
  };

  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !description || lessons.length === 0) {
      setError("Please fill in the course details and add at least one lesson.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mentor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, price, lessons }),
      });

      if (res.ok) {
        router.push("/dashboard/mentor/courses");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create course");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-scale-up">
      {/* Top Header */}
      <div className="text-xs text-muted-foreground flex items-center justify-between border-b border-border pb-5">
        <Link href="/dashboard/mentor/courses" className="hover:text-primary transition-colors">← Back to Courses</Link>
        <span className="font-semibold text-foreground">Create Program</span>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <form onSubmit={handleCreateCourse} className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-foreground">Course Configuration</h2>
            <p className="text-xs text-muted-foreground">Setup course title, BDT pricing, and curriculum syllabus.</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Course Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Frontend Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Description Overview</label>
            <textarea
              rows={4}
              required
              placeholder="Enter details on what students will learn..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Software & Coding</option>
                <option>UI/UX & Product Design</option>
                <option>IELTS & English</option>
                <option>Freelancing & Career</option>
                <option>Data Science & AI</option>
                <option>Digital Marketing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Price (৳ BDT)</label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Dynamic Lessons Builder */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wide">Curriculum Lessons</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Configure modules and lessons for students.</p>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground block">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js Routing Systems"
                  value={lessonTitleInput}
                  onChange={(e) => setLessonTitleInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground block">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 10:00"
                  value={lessonDurationInput}
                  onChange={(e) => setLessonDurationInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary text-center"
                />
              </div>
              <button
                type="button"
                onClick={handleAddLesson}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/95 transition-all h-9 cursor-pointer"
              >
                Add
              </button>
            </div>

            {lessons.length > 0 && (
              <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto border-t border-border/40">
                {lessons.map((les, index) => (
                  <div key={les.id} className="flex justify-between items-center p-2 rounded-lg border border-border bg-background/50 text-xs">
                    <span className="font-medium text-foreground">{index + 1}. {les.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground font-semibold">{les.duration}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="text-right pt-6 border-t border-border/60">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-10 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
