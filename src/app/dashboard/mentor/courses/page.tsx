"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CourseMeta {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  students: number;
  lessons: { id: string; title: string }[];
  published: boolean;
  createdAt: string;
}

export default function MentorCoursesListPage() {
  const [courses, setCourses] = useState<CourseMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/mentor/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      });
      if (res.ok) {
        setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, published: !currentStatus } : c)));
      }
    } catch (err) {
      console.error("Failed to toggle publish:", err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete course "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-muted rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Manage My Courses</h1>
          <p className="text-xs text-muted-foreground">Upload and configure lectures, set pricing in BDT, and review student metrics.</p>
        </div>
        <Link
          href="/dashboard/mentor/courses/new"
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg shadow-md shadow-primary/10 transition-all text-center"
        >
          + Create New Course
        </Link>
      </div>

      {/* Courses List Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between hover:shadow-sm transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold">
                    {course.category}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-semibold">৳{course.price.toLocaleString()} BDT</span>
                    {!course.published && (
                      <span className="block text-[8px] text-red-500 font-bold mt-0.5">DRAFT</span>
                    )}
                  </div>
                </div>

                <h3 className="font-extrabold text-sm text-foreground">
                  {course.title}
                </h3>

                <p className="text-[10px] text-muted-foreground line-clamp-2">{course.description}</p>

                <div className="grid grid-cols-2 gap-3 text-xs bg-background/50 border border-border/40 p-3 rounded-xl">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Enrolled Students</p>
                    <p className="font-semibold text-foreground mt-0.5">{course.students} students</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Lectures</p>
                    <p className="font-semibold text-foreground mt-0.5">{course.lessons.length} videos</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-5 pt-4 border-t border-border/60">
                <button
                  onClick={() => handleTogglePublish(course.id, course.published)}
                  className={`flex-1 h-9 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    course.published
                      ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/5"
                      : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5"
                  }`}
                >
                  {course.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(course.id, course.title)}
                  className="h-9 px-3 rounded-lg border border-red-500/30 text-red-500 text-xs font-bold hover:bg-red-500/5 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/50 space-y-3">
          <span className="text-3xl block">📚</span>
          <p className="text-xs text-muted-foreground font-medium">You haven&apos;t created any courses yet.</p>
          <Link
            href="/dashboard/mentor/courses/new"
            className="inline-block text-xs font-bold text-primary hover:underline"
          >
            Create your first course package now
          </Link>
        </div>
      )}
    </div>
  );
}
