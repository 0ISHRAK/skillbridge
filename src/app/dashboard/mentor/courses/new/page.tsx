"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewLesson {
  id: string;
  title: string;
  duration: string;
}

const PRESET_THUMBNAILS = [
  {
    name: "Web & Coding",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    category: "Software & Coding",
  },
  {
    name: "UI/UX Design",
    url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80",
    category: "UI/UX & Product Design",
  },
  {
    name: "IELTS & English",
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    category: "IELTS & English",
  },
  {
    name: "Data Science & AI",
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
    category: "Data Science & AI",
  },
  {
    name: "Digital Marketing",
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    category: "Digital Marketing",
  },
  {
    name: "Freelance & Career",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
    category: "Freelancing & Career",
  },
];

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Software & Coding");
  const [price, setPrice] = useState(1500);
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("4 weeks");
  const [thumbnail, setThumbnail] = useState(PRESET_THUMBNAILS[0].url);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState("");
  const [isCustomThumb, setIsCustomThumb] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

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
        { id: `lesson-${Date.now()}`, title: lessonTitleInput.trim(), duration: lessonDurationInput.trim() },
      ]);
      setLessonTitleInput("");
      setLessonDurationInput("10:00");
    }
  };

  const handleRemoveLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (file: File) => {
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const res = await fetch("/api/admin/courses/upload", {
        method: "POST",
        body: uploadData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setThumbnail(data.url);
          setIsCustomThumb(true);
        }
      }
    } catch {
      // Use Object URL fallback
      setThumbnail(URL.createObjectURL(file));
      setIsCustomThumb(true);
    }
  };

  const activeThumbnailUrl = isCustomThumb && customThumbnailUrl.trim()
    ? customThumbnailUrl.trim()
    : thumbnail;

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!title.trim()) {
      setError("Please enter a course title.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!description.trim()) {
      setError("Please enter a course description.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (lessons.length === 0) {
      setError("Please add at least one lesson syllabus item before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mentor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          price,
          level,
          duration,
          thumbnail: activeThumbnailUrl,
          lessons,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Course submitted successfully! It is now pending admin approval.");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
          router.push("/dashboard/mentor/courses");
        }, 1200);
      } else {
        setError(data.error || "Failed to submit course for approval.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      setError("Network error. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-scale-up">
      {/* Top Header */}
      <div className="text-xs text-muted-foreground flex items-center justify-between border-b border-border pb-5">
        <Link href="/dashboard/mentor/courses" className="hover:text-primary transition-colors">← Back to My Courses</Link>
        <span className="font-semibold text-foreground">Create Program</span>
      </div>

      {/* Admin Approval Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-3 shadow-xs">
        <span className="text-base leading-none">ℹ️</span>
        <div>
          <p className="font-bold">Course Approval Workflow</p>
          <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
            Courses created by mentors are submitted as <span className="font-bold">Pending Admin Approval</span>. Once an Admin reviews and approves your program, it will be published and available to students.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <form onSubmit={handleCreateCourse} className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-foreground">Course Configuration</h2>
            <p className="text-xs text-muted-foreground">Configure program details, thumbnail banner, BDT pricing, and lesson outline.</p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
              <span>✓</span> {successMsg}
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center animate-fade-in flex items-center justify-center gap-2">
              <span>✕</span> {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Course Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Advanced Next.js 15 & System Architecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-muted-foreground block">Description Overview *</label>
            <textarea
              rows={4}
              required
              placeholder="Provide a thorough summary of what students will master..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* THUMBNAIL SELECTION SECTION */}
          <div className="space-y-3 p-4 rounded-xl bg-background/50 border border-border/80">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold text-foreground block">Select Course Thumbnail Banner</label>
                <p className="text-[10px] text-muted-foreground">Pick a preset thumbnail image or provide custom upload/URL.</p>
              </div>
              {activeThumbnailUrl && (
                <div className="w-16 h-10 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
                  <img src={activeThumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Preset Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {PRESET_THUMBNAILS.map((item) => {
                const isSelected = !isCustomThumb && thumbnail === item.url;
                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => {
                      setThumbnail(item.url);
                      setIsCustomThumb(false);
                    }}
                    className={`relative rounded-lg overflow-hidden border text-left transition-all h-20 group ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/30 shadow-md"
                        : "border-border/60 opacity-80 hover:opacity-100 hover:border-primary/50"
                    }`}
                  >
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 flex items-end">
                      <span className="text-[10px] font-bold text-white truncate">{item.name}</span>
                    </div>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom URL or File Upload option */}
            <div className="pt-2 space-y-2 border-t border-border/40">
              <label className="text-[9px] uppercase font-bold text-muted-foreground block">Or Custom Image URL / Upload</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={customThumbnailUrl}
                  onChange={(e) => {
                    setCustomThumbnailUrl(e.target.value);
                    setIsCustomThumb(true);
                  }}
                  className="flex-1 text-xs p-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <label className="px-3 py-2 bg-accent hover:bg-accent/80 border border-border text-foreground text-xs font-bold rounded-lg cursor-pointer flex items-center shrink-0">
                  Upload File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setThumbnailFile(file);
                        void handleFileUpload(file);
                      }
                    }}
                  />
                </label>
              </div>
              {thumbnailFile && (
                <p className="text-[9px] text-emerald-500 font-semibold">Selected file: {thumbnailFile.name}</p>
              )}
            </div>
          </div>

          {/* Price, Category, Level, Duration */}
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

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Target Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground block">Estimated Duration</label>
              <input
                type="text"
                placeholder="e.g. 6 weeks"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Dynamic Lessons Builder */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wide">Curriculum Syllabus & Lessons *</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Add module lectures to structure the learning journey.</p>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground block">Lesson Title</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js App Router Architecture"
                  value={lessonTitleInput}
                  onChange={(e) => setLessonTitleInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[9px] uppercase font-bold text-muted-foreground block">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 15:00"
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
                Add Lesson
              </button>
            </div>

            {lessons.length > 0 && (
              <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto border-t border-border/40">
                {lessons.map((les, index) => (
                  <div key={les.id} className="flex justify-between items-center p-2.5 rounded-lg border border-border bg-background/50 text-xs">
                    <span className="font-medium text-foreground">{index + 1}. {les.title}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground font-semibold">{les.duration}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLesson(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold cursor-pointer"
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
          <div className="flex items-center justify-between pt-6 border-t border-border/60">
            <p className="text-[10px] text-muted-foreground font-semibold">
              * Requires Admin approval before appearing on site.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-10 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Course for Admin Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

