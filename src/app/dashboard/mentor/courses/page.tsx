"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface CourseMeta {
  id: string;
  title: string;
  category: string;
  price: number;
  students: number;
  lessons: number;
  published: boolean;
}

export default function MentorCoursesListPage() {
  const [courses, setCourses] = useState<CourseMeta[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("mentorCourses");
    if (saved) {
      setTimeout(() => setCourses(JSON.parse(saved)), 0);
    } else {
      const defaultCourses: CourseMeta[] = [
        {
          id: "mern-freelancing",
          title: "MERN Stack Development for Freelancing",
          category: "Software & Coding",
          price: 2000,
          students: 12,
          lessons: 20,
          published: true,
        },
        {
          id: "figma-uiux-bootcamp",
          title: "Advanced Dashboard UI/UX Design",
          category: "UI/UX & Product Design",
          price: 1500,
          students: 0,
          lessons: 10,
          published: false,
        }
      ];
      localStorage.setItem("mentorCourses", JSON.stringify(defaultCourses));
      setTimeout(() => setCourses(defaultCourses), 0);
    }
  }, []);

  const handleTogglePublish = (id: string) => {
    const updated = courses.map((c) => {
      if (c.id === id) {
        const nextState = !c.published;
        alert(`Course is now ${nextState ? "Published" : "Unpublished"}!`);
        return { ...c, published: nextState };
      }
      return c;
    });
    setCourses(updated);
    localStorage.setItem("mentorCourses", JSON.stringify(updated));
  };

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
                  <span className="text-[10px] text-muted-foreground font-semibold">৳{course.price.toLocaleString()} BDT</span>
                </div>

                <h3 className="font-extrabold text-sm text-foreground hover:text-primary transition-colors">
                  {course.title}
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs bg-background/50 border border-border/40 p-3 rounded-xl">
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Enrolled Students</p>
                    <p className="font-semibold text-foreground mt-0.5">{course.students} students</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase">Lectures</p>
                    <p className="font-semibold text-foreground mt-0.5">{course.lessons} videos</p>
                  </div>
                </div>
              </div>

              {/* Action toggles */}
              <div className="flex gap-3 mt-5 pt-4 border-t border-border/60">
                <button
                  onClick={() => handleTogglePublish(course.id)}
                  className={`flex-1 h-9 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    course.published
                      ? "border-amber-500/30 text-amber-500 hover:bg-amber-500/5"
                      : "border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/5"
                  }`}
                >
                  {course.published ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/dashboard/mentor/courses/edit?id=${course.id}`}
                  className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10 cursor-pointer"
                >
                  Edit Syllabus
                </Link>
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
