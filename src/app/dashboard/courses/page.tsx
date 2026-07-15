"use client";

import Link from "next/link";

export default function MyCoursesPage() {
  const enrolledCourses = [
    {
      id: "mern-freelancing",
      title: "MERN Stack Development for Freelancing",
      category: "Software & Coding",
      progress: 40,
      lessonsDone: 8,
      totalLessons: 20,
      mentor: "Tanzim Hasan",
      duration: "12 Weeks",
      avatar: "👨‍💻",
    },
    {
      id: "figma-uiux",
      title: "Figma UI/UX Design Boot Camp",
      category: "UI/UX & Product Design",
      progress: 20,
      lessonsDone: 3,
      totalLessons: 15,
      mentor: "Sabrina Rahman",
      duration: "8 Weeks",
      avatar: "👩‍🎨",
    },
  ];

  return (
    <div className="space-y-6 animate-scale-up">
      <div className="space-y-1 border-b border-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">My Enrolled Courses</h1>
        <p className="text-xs text-muted-foreground">Access your curriculum, play lectures, and complete assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20 font-bold">
                  {course.category}
                </span>
                <span className="text-[10px] text-muted-foreground">{course.duration}</span>
              </div>

              <h3 className="font-extrabold text-base hover:text-primary transition-colors">
                <Link href={`/dashboard/courses/${course.id}`}>{course.title}</Link>
              </h3>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{course.avatar}</span>
                <span>Mentor: <span className="font-semibold text-foreground">{course.mentor}</span></span>
              </div>

              {/* Progress Bar widget */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                  <span>{course.lessonsDone} of {course.totalLessons} Lessons Done</span>
                  <span className="text-primary">{course.progress}%</span>
                </div>
                <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href={`/dashboard/courses/${course.id}`}
                className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
              >
                Resume Course Player
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
