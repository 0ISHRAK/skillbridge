"use client";

import { useState, useEffect } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  published: boolean;
  lessons: { id: string; title: string }[];
  mentorId: string;
  mentorName: string;
  createdAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
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

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      });
      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, published: !currentStatus } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle course:", err);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Delete course "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    }
  };

  const categories = [...new Set(courses.map((c) => c.category))];

  const filtered = courses.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.mentorName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-1/3" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Course Management</h1>
        <p className="text-xs text-muted-foreground mt-1">{courses.length} courses on platform</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search courses or mentors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:border-primary"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Course List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-xs bg-card border border-border rounded-2xl">
            No courses found.
          </div>
        ) : (
          filtered.map((course) => (
            <div key={course.id} className="p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate">{course.title}</h3>
                    {!course.published && (
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-red-500/10 text-red-500">UNPUBLISHED</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{course.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                    <span>By: <span className="font-bold text-foreground">{course.mentorName}</span></span>
                    <span>Category: <span className="font-bold text-foreground">{course.category}</span></span>
                    <span>Lessons: <span className="font-bold text-foreground">{course.lessons.length}</span></span>
                    <span>Price: <span className="font-bold text-primary">৳{course.price.toLocaleString()}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(course.id, course.published)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                      course.published
                        ? "border border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                  >
                    {course.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 text-[10px] font-bold hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
