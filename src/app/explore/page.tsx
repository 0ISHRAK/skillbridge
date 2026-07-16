"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type SkillPost = {
  id: string;
  authorId: string;
  authorName: string;
  offeredSkill: string;
  recommendedSkill: string;
  description: string | null;
  tokenCost: number;
  isOpen: boolean;
  createdAt: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  lessons: string[];
  mentorId: string;
  mentorName: string;
  published: boolean;
};

type Mentor = {
  id: string;
  name: string;
  bio: string;
  hourlyRate: number;
  skills: string[];
  availabilityDays: string[];
  avatarUrl: string | null;
};

const LEVEL_MAP: Record<string, string> = {
  "Software & Coding": "Intermediate",
  "UI/UX & Product Design": "Beginner",
  "IELTS & Communication": "Intermediate",
  "Freelancing & Career": "Beginner",
  "Digital Marketing": "Advanced",
};

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("q") || "";
  const initialCat = searchParams?.get("category") || "";

  const [activeTab, setActiveTab] = useState<"courses" | "mentors" | "exchange">("courses");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [maxPrice, setMaxPrice] = useState(5000);

  const [courses, setCourses] = useState<Course[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [skillPosts, setSkillPosts] = useState<SkillPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mySkills, setMySkills] = useState<string[]>([]);

  // Exchange request modal state
  const [requestModal, setRequestModal] = useState<{ post: SkillPost } | null>(null);
  const [reqType, setReqType] = useState<"barter" | "token">("barter");
  const [reqOfferedSkill, setReqOfferedSkill] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState("");
  const [reqSuccess, setReqSuccess] = useState(false);

  const categoriesList = [
    "Software & Coding",
    "UI/UX & Product Design",
    "IELTS & Communication",
    "Freelancing & Career",
    "Digital Marketing",
  ];

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError("");
      try {
        const [coursesRes, mentorsRes, postsRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/mentors"),
          fetch("/api/skill-posts"),
        ]);
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setCourses(data.courses || []);
        }
        if (mentorsRes.ok) {
          const data = await mentorsRes.json();
          setMentors(data.mentors || []);
        }
        if (postsRes.ok) {
          const data = await postsRes.json();
          setSkillPosts(data.posts || []);
        }
      } catch {
        setError("Failed to load data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();

    // Check subscription + get my skills (silently)
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((data) => { if (data.subscription?.isActive) setIsSubscribed(true); })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.skillsList) {
          try {
            setMySkills(JSON.parse(data.user.skillsList) as string[]);
          } catch { /* not logged in or no skills */ }
        }
      })
      .catch(() => {});
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.mentorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory
        ? course.category.toLowerCase() === selectedCategory.toLowerCase()
        : true;
      const courseLevel = LEVEL_MAP[course.category] || "Beginner";
      const matchesLevel = selectedLevel
        ? courseLevel.toLowerCase() === selectedLevel.toLowerCase()
        : true;
      const matchesPrice = course.price <= maxPrice;
      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel, maxPrice]);

  const filteredPosts = useMemo(() => {
    return skillPosts.filter((post) => {
      return (
        post.offeredSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.recommendedSkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [skillPosts, searchQuery]);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const matchesSearch =
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = maxPrice >= (mentor.hourlyRate || 0);
      return matchesSearch && matchesPrice;
    });
  }, [mentors, searchQuery, maxPrice]);

  const openRequestModal = (post: SkillPost) => {
    setRequestModal({ post });
    setReqType(mySkills.some((s) => s.toLowerCase() === post.recommendedSkill.toLowerCase()) ? "barter" : "token");
    setReqOfferedSkill("");
    setReqMessage("");
    setReqError("");
    setReqSuccess(false);
  };

  const handleSubmitRequest = async () => {
    if (!requestModal) return;
    setReqLoading(true);
    setReqError("");
    try {
      const res = await fetch("/api/skill-exchange/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: requestModal.post.id,
          type: reqType,
          offeredSkill: reqType === "barter" ? reqOfferedSkill : undefined,
          message: reqMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReqError(data.error || "Failed to send request.");
        return;
      }
      setReqSuccess(true);
    } catch {
      setReqError("Network error. Please try again.");
    } finally {
      setReqLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedLevel("");
    setMaxPrice(5000);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-xl bg-card border border-border animate-pulse">
          <div className="h-3 bg-accent rounded w-1/3 mb-3" />
          <div className="h-4 bg-accent rounded w-3/4 mb-2" />
          <div className="h-3 bg-accent rounded w-full mb-1" />
          <div className="h-3 bg-accent rounded w-2/3" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Explore Skillbridge</h1>
        <p className="text-sm text-muted-foreground">
          Find localized courses and elite mentors. Secure payments via bKash & Nagad.
        </p>
      </div>

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => { setActiveTab("courses"); resetFilters(); }}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
            activeTab === "courses"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Courses & Classes
        </button>
        <button
          onClick={() => { setActiveTab("mentors"); resetFilters(); }}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
            activeTab === "mentors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          1-on-1 Mentors
        </button>
        <button
          onClick={() => { setActiveTab("exchange"); resetFilters(); }}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-all ${
            activeTab === "exchange"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Skill Exchange
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3 space-y-6 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Filters</h3>
            <button onClick={resetFilters} className="text-xs text-primary hover:underline font-medium">
              Reset All
            </button>
          </div>

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

          {activeTab === "courses" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs p-2 rounded-md border border-input bg-background focus:outline-none"
              >
                <option value="">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

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

        <main className="lg:col-span-9">
          {activeTab === "courses" && (
            <div>
              {!isLoading && (
                <p className="text-xs text-muted-foreground mb-4">
                  Showing {filteredCourses.length} course{filteredCourses.length !== 1 && "s"} matching your criteria
                </p>
              )}

              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                  <span className="text-3xl">🔍</span>
                  <p className="mt-2 text-sm font-semibold">No courses found</p>
                  <p className="text-xs text-muted-foreground mt-1">Try resetting the filters or modifying your query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCourses.map((course) => {
                    const level = LEVEL_MAP[course.category] || "Beginner";
                    const lessonCount = Array.isArray(course.lessons) ? course.lessons.length : 0;
                    return (
                      <div
                        key={course.id}
                        className="p-5 rounded-xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium">
                              {course.category}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">{lessonCount} lessons</span>
                          </div>

                          <h3 className="font-bold text-base hover:text-primary transition-colors">
                            <Link href={`/skills/${course.id}`}>{course.title}</Link>
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>

                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-xs">👤</span>
                            <span className="text-xs font-semibold text-foreground">{course.mentorName}</span>
                          </div>
                        </div>

                        <div className="border-t border-border/60 pt-4 flex items-center justify-between mt-4">
                          <div>
                            <p className="text-[9px] text-muted-foreground">Difficulty Level: {level}</p>
                          </div>
                          <div className="text-right">
                            {isSubscribed ? (
                              <span className="px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                ✓ Included in your plan
                              </span>
                            ) : (
                              <>
                                <p className="text-[9px] text-muted-foreground">Course Fee</p>
                                <p className="text-base font-extrabold text-primary">৳{course.price.toLocaleString()}</p>
                              </>
                            )}
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
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "exchange" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-muted-foreground">
                  {filteredPosts.length} open skill exchange offer{filteredPosts.length !== 1 && "s"}
                </p>
                <Link
                  href="/dashboard/exchanges"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  + Post a Skill
                </Link>
              </div>

              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border rounded-xl">
                  <span className="text-3xl">🤝</span>
                  <p className="mt-2 text-sm font-semibold">No skill exchange offers yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Be the first — post a skill you want to exchange.</p>
                  <Link
                    href="/dashboard/exchanges"
                    className="inline-block mt-4 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                  >
                    Post a Skill
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPosts.map((post) => {
                    const canBarter = mySkills.some(
                      (s) => s.toLowerCase() === post.recommendedSkill.toLowerCase()
                    );
                    return (
                      <div
                        key={post.id}
                        className="p-5 rounded-xl bg-card border border-border hover:shadow-lg hover:shadow-primary/5 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 font-medium">
                              Offers: {post.offeredSkill}
                            </span>
                            {canBarter ? (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                Barter Match
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] bg-accent text-accent-foreground border border-border font-medium">
                                {post.tokenCost} tokens
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Wants in return</p>
                            <p className="text-sm font-bold text-foreground mt-0.5">{post.recommendedSkill}</p>
                          </div>

                          {post.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{post.description}</p>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-xs">👤</span>
                            <span className="text-xs font-semibold text-foreground">{post.authorName}</span>
                          </div>
                        </div>

                        <div className="border-t border-border/60 pt-4 mt-4">
                          <button
                            onClick={() => openRequestModal(post)}
                            className="w-full h-9 flex items-center justify-center font-bold text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-all"
                          >
                            {canBarter ? "Request Barter Exchange" : `Learn with Tokens (${post.tokenCost})`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "mentors" && (
            <div>
              {!isLoading && (
                <p className="text-xs text-muted-foreground mb-4">
                  Showing {filteredMentors.length} mentor{filteredMentors.length !== 1 && "s"} matching your criteria
                </p>
              )}

              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredMentors.length === 0 ? (
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
                          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-xl border border-primary/20 overflow-hidden">
                            {mentor.avatarUrl ? (
                              <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
                            ) : (
                              "👤"
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{mentor.name}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{mentor.bio || "Verified Mentor"}</p>
                          </div>
                        </div>

                        {mentor.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {mentor.skills.slice(0, 4).map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded text-[9px] bg-accent text-accent-foreground border border-border font-medium"
                              >
                                {s}
                              </span>
                            ))}
                            {mentor.skills.length > 4 && (
                              <span className="px-2 py-0.5 rounded text-[9px] bg-accent text-accent-foreground border border-border font-medium">
                                +{mentor.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        {mentor.availabilityDays.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Availability:</span>
                              <span className="font-semibold text-foreground">
                                {mentor.availabilityDays.slice(0, 3).map(d => d.substring(0, 3)).join(", ")}
                                {mentor.availabilityDays.length > 3 ? "..." : ""}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border/60 pt-4 flex items-center justify-between mt-4">
                        <div>
                          <p className="text-[9px] text-muted-foreground">Consultation Fee</p>
                          <p className="text-base font-extrabold text-primary">
                            ৳{(mentor.hourlyRate || 0).toLocaleString()}/hr
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link
                          href="/dashboard/book"
                          className="w-full h-9 flex items-center justify-center font-bold text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-all text-center"
                        >
                          Book a 1-on-1 Session
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {/* Skill Exchange Request Modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base">Request Exchange</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Learn <span className="font-semibold text-foreground">{requestModal.post.offeredSkill}</span> from {requestModal.post.authorName}
                </p>
              </div>
              <button onClick={() => setRequestModal(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            </div>

            {reqSuccess ? (
              <div className="text-center py-6 space-y-3">
                <span className="text-4xl">✅</span>
                <p className="font-bold text-sm">Request Sent!</p>
                <p className="text-xs text-muted-foreground">
                  {requestModal.post.authorName} will review your request and accept or decline.
                </p>
                <button
                  onClick={() => setRequestModal(null)}
                  className="mt-2 px-5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {reqError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center">
                    {reqError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Exchange Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReqType("barter")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        reqType === "barter"
                          ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 font-bold shadow-sm"
                          : "border-border text-muted-foreground hover:border-emerald-500/50"
                      }`}
                    >
                      <p className="text-sm">🤝</p>
                      <p className="text-xs font-semibold mt-1">Barter</p>
                      <p className="text-[9px] text-muted-foreground">Free — teach back</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReqType("token")}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        reqType === "token"
                          ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <p className="text-sm">🪙</p>
                      <p className="text-xs font-semibold mt-1">Tokens</p>
                      <p className="text-[9px] text-muted-foreground">{requestModal.post.tokenCost} tokens</p>
                    </button>
                  </div>
                </div>

                {reqType === "barter" && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Skill you will teach back <span className="text-destructive">*</span>
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      They want: <span className="font-semibold text-foreground">{requestModal.post.recommendedSkill}</span>
                    </p>
                    <input
                      type="text"
                      placeholder={`e.g. ${requestModal.post.recommendedSkill}`}
                      value={reqOfferedSkill}
                      onChange={(e) => setReqOfferedSkill(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Introduction Message (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tell them a bit about yourself and why you want to exchange..."
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmitRequest}
                  disabled={reqLoading || (reqType === "barter" && !reqOfferedSkill.trim())}
                  className="w-full h-10 flex items-center justify-center font-bold text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {reqLoading ? "Sending..." : reqType === "barter" ? "Send Barter Request (Free)" : `Send Request (${requestModal.post.tokenCost} tokens)`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
