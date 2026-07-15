"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Mock Data for Bangladesh-localized Courses
const initialCourses = [
  {
    id: "mern-freelancing",
    title: "MERN Stack Development for Freelancing",
    description: "Learn MongoDB, Express, React, Node.js and build custom web applications for Upwork & Fiverr clients.",
    category: "Software & Coding",
    level: "Intermediate",
    rating: 4.9,
    reviewsCount: 142,
    price: 2500,
    duration: "12 Weeks",
    mentor: "Tanzim Hasan",
    mentorCompany: "TigerIT",
    avatar: "👨‍💻",
  },
  {
    id: "figma-uiux",
    title: "Figma UI/UX Design Boot Camp",
    description: "Master modern wireframing, high-fidelity UI designs, prototyping, and developer handoffs in Figma.",
    category: "UI/UX & Product Design",
    level: "Beginner",
    rating: 4.8,
    reviewsCount: 88,
    price: 1800,
    duration: "8 Weeks",
    mentor: "Sabrina Rahman",
    mentorCompany: "Pathao",
    avatar: "👩‍🎨",
  },
  {
    id: "ielts-speaking",
    title: "IELTS Speaking & Writing Prep",
    description: "Target Band 7.5+ with targeted feedback, mocks, and common topics for study abroad candidates.",
    category: "IELTS & Communication",
    level: "Intermediate",
    rating: 4.7,
    reviewsCount: 65,
    price: 1200,
    duration: "6 Weeks",
    mentor: "Farhana Yasmin",
    mentorCompany: "DU Alumna",
    avatar: "👩‍🏫",
  },
  {
    id: "freelance-masterclass",
    title: "Upwork & Fiverr Freelancing Masterclass",
    description: "Complete guide on landing remote gigs, writing proposals, setting up billing, and client communication.",
    category: "Freelancing & Career",
    level: "Beginner",
    rating: 5.0,
    reviewsCount: 94,
    price: 1500,
    duration: "4 Weeks",
    mentor: "Sabrina Rahman",
    mentorCompany: "Freelancer",
    avatar: "👩‍🎨",
  },
  {
    id: "nextjs-advanced",
    title: "Advanced Next.js & Tailwind CSS v4",
    description: "Deep dive into App Router features, React Server Components, server actions, and compiling styles with Tailwind CSS v4.",
    category: "Software & Coding",
    level: "Advanced",
    rating: 4.9,
    reviewsCount: 52,
    price: 3000,
    duration: "5 Weeks",
    mentor: "Tanzim Hasan",
    mentorCompany: "TigerIT",
    avatar: "👨‍💻",
  },
  {
    id: "product-management",
    title: "Product Management for Tech Startups",
    description: "Learn product discovery, market fits, user personas, writing PRDs, and analytics dashboards.",
    category: "Digital Marketing",
    level: "Advanced",
    rating: 4.9,
    reviewsCount: 71,
    price: 4000,
    duration: "8 Weeks",
    mentor: "Ariful Islam",
    mentorCompany: "bKash",
    avatar: "👨&zwj;💼",
  },
];

// Mock Data for Bangladesh-localized Mentors
const initialMentors = [
  {
    id: "tanzim-hasan",
    name: "Tanzim Hasan",
    role: "Senior Software Engineer @ TigerIT",
    almaMater: "BUET '18",
    category: "Software & Coding",
    rating: 4.9,
    reviewsCount: 120,
    hourlyRate: 1500,
    skills: ["React", "Node.js", "System Design", "Next.js"],
    avatar: "👨‍💻",
    available: "Mon, Wed, Fri",
  },
  {
    id: "sabrina-rahman",
    name: "Sabrina Rahman",
    role: "Lead UI/UX Designer @ Pathao",
    almaMater: "DU '19",
    category: "UI/UX & Product Design",
    rating: 4.8,
    reviewsCount: 85,
    hourlyRate: 1200,
    skills: ["Figma", "Design Systems", "Prototyping", "UX Audit"],
    avatar: "👩‍🎨",
    available: "Tue, Thu",
  },
  {
    id: "ariful-islam",
    name: "Ariful Islam",
    role: "Product Manager @ bKash",
    almaMater: "IBA, DU",
    category: "Freelancing & Career",
    rating: 5.0,
    reviewsCount: 90,
    hourlyRate: 2000,
    skills: ["Agile PM", "Product Strategy", "KPIs", "User Interviews"],
    avatar: "👨‍💼",
    available: "Saturdays",
  },
  {
    id: "farhana-yasmin",
    name: "Farhana Yasmin",
    role: "IELTS Consultant & Trainer",
    almaMater: "Dhaka University",
    category: "IELTS & Communication",
    rating: 4.7,
    reviewsCount: 48,
    hourlyRate: 1000,
    skills: ["IELTS Prep", "Spoken English", "Academic Writing"],
    avatar: "👩‍🏫",
    available: "Daily slots",
  },
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("q") || "";
  const initialCat = searchParams?.get("category") || "";

  // State Management
  const [activeTab, setActiveTab] = useState<"courses" | "mentors">("courses");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);

  // Filter Categories
  const categoriesList = [
    "Software & Coding",
    "UI/UX & Product Design",
    "IELTS & Communication",
    "Freelancing & Career",
    "Digital Marketing",
  ];

  // Filtering Logic
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.mentor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory
        ? course.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;

      const matchesLevel = selectedLevel
        ? course.level.toLowerCase() === selectedLevel.toLowerCase()
        : true;

      const matchesPrice = course.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });
  }, [searchQuery, selectedCategory, selectedLevel, maxPrice]);

  const filteredMentors = useMemo(() => {
    return initialMentors.filter((mentor) => {
      const matchesSearch =
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory
        ? mentor.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;

      const matchesPrice = mentor.hourlyRate <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchQuery, selectedCategory, maxPrice]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
    setMaxPrice(5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      {/* Top Banner / Headline */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Explore Skillbridge</h1>
        <p className="text-sm text-muted-foreground">
          Find localized courses and elite mentors. Secure payments via bKash & Nagad.
        </p>
      </div>

      {/* Tabs Switch */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => {
            setActiveTab("courses");
            resetFilters();
          }}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
            activeTab === "courses"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Courses & Classes
        </button>
        <button
          onClick={() => {
            setActiveTab("mentors");
            resetFilters();
          }}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
            activeTab === "mentors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          1-on-1 Mentors
        </button>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-3 space-y-6 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
            <button
              onClick={resetFilters}
              className="text-xs text-primary hover:underline font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Search Bar inside Filters */}
          <div className="space-y-2">
            <label className="text-xs font-semibold">Keywords</label>
            <div className="relative flex items-center border border-input rounded-md px-3 bg-background">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs py-2 bg-transparent text-foreground focus:outline-none ml-2"
              />
            </div>
          </div>

          {/* Categories Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs p-2 rounded-md border border-input bg-background focus:outline-none"
            >
              <option value="">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter (Only for Courses) */}
          {activeTab === "courses" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold">Skill Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-input bg-background focus:outline-none"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          )}

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Max Fee / Price</span>
              <span className="text-primary font-bold">৳{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-accent rounded-lg h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>৳500</span>
              <span>৳5,000</span>
            </div>
          </div>
        </aside>

        {/* Results Area */}
        <main className="lg:col-span-9">
          {/* Courses Tab View */}
          {activeTab === "courses" && (
            <div>
              <p className="text-xs text-muted-foreground mb-4">
                Showing {filteredCourses.length} localized course{filteredCourses.length !== 1 && "s"} matching your criteria
              </p>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                  <span className="text-3xl">🔍</span>
                  <p className="mt-2 text-sm font-semibold">No courses found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try resetting the filters or modifying your query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-5 rounded-xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium">
                            {course.category}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">{course.duration}</span>
                        </div>

                        <h3 className="font-bold text-base hover:text-primary transition-colors">
                          <Link href={`/skills/${course.id}`}>{course.title}</Link>
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-xs">{course.avatar}</span>
                          <span className="text-xs font-semibold text-foreground">
                            {course.mentor}{" "}
                            <span className="text-[10px] font-normal text-muted-foreground">
                              ({course.mentorCompany})
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-border/60 pt-4 flex items-center justify-between mt-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Difficulty Level: {course.level}</p>
                          <p className="text-xs font-bold mt-0.5 text-amber-500">⭐ {course.rating} <span className="font-normal text-[10px] text-muted-foreground">({course.reviewsCount})</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground">Course Fee</p>
                          <p className="text-base font-extrabold text-primary">৳{course.price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href={`/skills/${course.id}`}
                          className="w-full h-9 flex items-center justify-center font-bold text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-all text-center"
                        >
                          View Syllabus & Register
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mentors Tab View */}
          {activeTab === "mentors" && (
            <div>
              <p className="text-xs text-muted-foreground mb-4">
                Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 && "s"} matching your criteria
              </p>

              {filteredMentors.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                  <span className="text-3xl">🔍</span>
                  <p className="mt-2 text-sm font-semibold">No mentors found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try resetting the filters or modifying your query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMentors.map((mentor) => (
                    <div
                      key={mentor.id}
                      className="p-5 rounded-xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-xl border border-primary/20">
                            {mentor.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{mentor.name}</h3>
                            <p className="text-xs text-muted-foreground">{mentor.role}</p>
                            <p className="text-[9px] text-primary/80 font-bold">{mentor.almaMater}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {mentor.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded text-[9px] bg-accent text-accent-foreground border border-border font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex justify-between">
                            <span>Availability:</span>
                            <span className="font-semibold text-foreground">{mentor.available}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-semibold text-foreground">{mentor.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/60 pt-4 flex items-center justify-between mt-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Rating</p>
                          <p className="text-xs font-semibold text-amber-500">⭐ {mentor.rating} <span className="font-normal text-[10px] text-muted-foreground">({mentor.reviewsCount} reviews)</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-muted-foreground">Consultation Fee</p>
                          <p className="text-base font-extrabold text-primary">৳{mentor.hourlyRate.toLocaleString()}/hr</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => alert(`Redirecting to book session with ${mentor.name}`)}
                          className="w-full h-9 flex items-center justify-center font-bold text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-all text-center"
                        >
                          Book a 1-on-1 Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading explore options...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
