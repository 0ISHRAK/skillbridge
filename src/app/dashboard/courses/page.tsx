"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Enrollment = {
  id: string;
  courseId: string;
  completedLessons: string[];
  course: {
    id: string;
    title: string;
    category: string;
    price: number;
    lessons: string[];
    mentorName: string;
  };
};

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const res = await fetch("/api/courses/enrollments");
        if (res.ok) {
          const data = await res.json();
          setEnrollments(data.enrollments || []);
        } else if (res.status === 401) {
          setError("Please log in to view your courses.");
        } else {
          setError("Failed to load courses.");
        }
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchEnrollments();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-scale-up">
        <div className="space-y-1 border-b border-border pb-5">
          <h1 className="text-2xl font-extrabold tracking-tight">My Enrolled Courses</h1>
          <p className="text-xs text-muted-foreground">Access your curriculum, play lectures, and complete assignments.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-border animate-pulse">
              <div className="h-3 bg-accent rounded w-1/3 mb-3" />
              <div className="h-5 bg-accent rounded w-3/4 mb-4" />
              <div className="h-3 bg-accent rounded w-1/2 mb-2" />
              <div className="h-2 bg-accent rounded w-full mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-up">
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">My Enrolled Courses</h1>
        <p className="text-xs text-muted-foreground">Access your curriculum, play lectures, and complete assignments.</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      )}

      {!error && enrollments.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <span className="text-4xl block mb-3">🎓</span>
          <h3 className="font-bold text-base mb-1">No courses yet</h3>
          <p className="text-xs text-muted-foreground mb-4">Browse our catalog and enroll in a course to get started.</p>
          <Link
            href="/explore"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const totalLessons = Array.isArray(course.lessons) ? course.lessons.length : 0;
            const doneLessons = Array.isArray(enrollment.completedLessons) ? enrollment.completedLessons.length : 0;
            const progress = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

            return (
              <div
                key={enrollment.id}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold">
                      {course.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{totalLessons} lessons</span>
                  </div>

                  <h3 className="font-extrabold text-base hover:text-primary transition-colors">
                    <Link href={`/dashboard/courses/${course.id}`}>{course.title}</Link>
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>👤</span>
                    <span>Mentor: <span className="font-semibold text-foreground">{course.mentorName}</span></span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                      <span>{doneLessons} of {totalLessons} Lessons Done</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
                  >
                    {progress === 100 ? "Review Course" : progress > 0 ? "Resume Course Player" : "Start Learning"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
