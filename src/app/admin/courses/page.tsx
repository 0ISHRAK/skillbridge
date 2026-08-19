"use client";

import { useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  mentorName: string;
  thumbnail: string | null;
  price: number;
  level: string;
  duration: string | null;
  published: boolean;
  isApproved?: boolean;
  approvalStatus?: string;
  whatYouLearn: string[];
  requirements: string[];
  lessons: { id: string; title: string; duration: string }[];
};

type CourseForm = {
  title: string;
  description: string;
  category: string;
  instructor: string;
  thumbnail: string;
  price: string;
  level: string;
  duration: string;
  whatYouLearn: string;
  requirements: string;
  lessons: string;
  published: boolean;
};

const emptyForm: CourseForm = {
  title: "",
  description: "",
  category: "Software & Coding",
  instructor: "",
  thumbnail: "",
  price: "0",
  level: "Beginner",
  duration: "",
  whatYouLearn: "",
  requirements: "",
  lessons: "",
  published: false,
};

const splitLines = (value: string) => value.split("\n").map((line) => line.trim()).filter(Boolean);

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState<CourseForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses", { cache: "no-store", credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load courses");
      setCourses(data.courses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadCourses(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateForm = (key: keyof CourseForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setThumbnailFile(null);
    setError("");
  };

  const editCourse = (course: Course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      instructor: course.mentorName,
      thumbnail: course.thumbnail || "",
      price: String(course.price),
      level: course.level,
      duration: course.duration || "",
      whatYouLearn: course.whatYouLearn.join("\n"),
      requirements: course.requirements.join("\n"),
      lessons: course.lessons.map((lesson) => lesson.title).join("\n"),
      published: course.published,
    });
    setThumbnailFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      let thumbnail = form.thumbnail;

      if (thumbnailFile) {
        const uploadData = new FormData();
        uploadData.append("file", thumbnailFile);
        const uploadResponse = await fetch("/api/admin/courses/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.error || "Unable to upload thumbnail");
        thumbnail = uploadResult.url;
      }

      const endpoint = editingId ? `/api/admin/courses/${editingId}` : "/api/admin/courses";
      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          thumbnail,
          price: Number(form.price),
          whatYouLearn: splitLines(form.whatYouLearn),
          requirements: splitLines(form.requirements),
          lessons: splitLines(form.lessons).map((title, index) => ({
            id: `lesson-${index + 1}`,
            title,
            duration: "",
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save course");
      await loadCourses();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save course");
    } finally {
      setSaving(false);
    }
  };

  const showMsg = (type: "ok" | "err", text: string) => {
    setActionMsg({ type, text });
    window.setTimeout(() => setActionMsg(null), 4000);
  };

  const handleApprove = async (course: Course) => {
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await response.json();
      if (!response.ok) {
        showMsg("err", `Approve failed (${response.status}): ${data?.error || "Unknown error"}`);
        return;
      }
      // Update state immediately then re-fetch from server
      setCourses((current) =>
        current.map((item) =>
          item.id === course.id
            ? { ...item, isApproved: true, approvalStatus: "approved", published: true }
            : item
        )
      );
      showMsg("ok", `"${course.title}" approved and published!`);
      await loadCourses();
    } catch (err) {
      showMsg("err", `Network error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleReject = async (course: Course) => {
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reject" }),
      });
      const data = await response.json();
      if (!response.ok) {
        showMsg("err", `Reject failed (${response.status}): ${data?.error || "Unknown error"}`);
        return;
      }
      setCourses((current) =>
        current.map((item) =>
          item.id === course.id
            ? { ...item, isApproved: false, approvalStatus: "rejected", published: false }
            : item
        )
      );
      showMsg("ok", `"${course.title}" has been rejected.`);
      await loadCourses();
    } catch (err) {
      showMsg("err", `Network error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const deleteCourse = async (course: Course) => {
    if (!window.confirm(`Delete course "${course.title}"? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
    if (response.ok) setCourses((current) => current.filter((item) => item.id !== course.id));
  };

  const categories = [...new Set(courses.map((course) => course.category).filter(Boolean))];
  const pendingCourses = courses.filter(
    (c) => (c.approvalStatus || (c.isApproved ? "approved" : "pending")) === "pending"
  );
  const approvedCourses = courses.filter(
    (c) => (c.approvalStatus || (c.isApproved ? "approved" : "pending")) === "approved"
  );
  const rejectedCourses = courses.filter(
    (c) => (c.approvalStatus || (c.isApproved ? "approved" : "pending")) === "rejected"
  );

  const filteredCourses = courses.filter((course) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (course.title || "").toLowerCase().includes(query) ||
      (course.mentorName || "").toLowerCase().includes(query) ||
      (course.category || "").toLowerCase().includes(query);
    const matchesCategory = category === "all" || course.category === category;
    
    const status = course.approvalStatus || (course.isApproved ? "approved" : "pending");
    const matchesApproval =
      approvalFilter === "all" ||
      (approvalFilter === "pending" && status === "pending") ||
      (approvalFilter === "approved" && status === "approved") ||
      (approvalFilter === "rejected" && status === "rejected");

    return matchesSearch && matchesCategory && matchesApproval;
  });

  if (loading) return <div className="space-y-6 animate-pulse"><div className="h-10 w-1/3 rounded-xl bg-muted" /><div className="h-96 rounded-2xl bg-muted" /></div>;

  return (
    <div className="space-y-6">
      {actionMsg && (
        <div className={`fixed top-5 right-5 z-50 rounded-xl px-5 py-3 text-xs font-bold shadow-xl ${
          actionMsg.type === "ok" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {actionMsg.text}
        </div>
      )}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Course Management & Approvals</h1>
          <p className="mt-1 text-xs text-muted-foreground">Review mentor course submissions, approve or reject programs, and manage live course catalog.</p>
        </div>
        <button
          onClick={() => { void loadCourses(); showMsg("ok", "Refreshed course list"); }}
          className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-accent flex items-center gap-1.5"
        >
          🔄 Refresh List
        </button>
      </header>

      {/* Quick Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setApprovalFilter("all")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            approvalFilter === "all" ? "border-primary bg-primary/5 shadow-xs" : "border-border bg-card hover:border-primary/50"
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Courses</p>
          <p className="text-xl font-extrabold mt-1">{courses.length}</p>
        </button>
        <button
          onClick={() => setApprovalFilter("pending")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            approvalFilter === "pending" ? "border-amber-500 bg-amber-500/10 shadow-xs" : "border-border bg-card hover:border-amber-500/50"
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-amber-500">🟡 Pending Approval</p>
          <p className="text-xl font-extrabold text-amber-500 mt-1">{pendingCourses.length}</p>
        </button>
        <button
          onClick={() => setApprovalFilter("approved")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            approvalFilter === "approved" ? "border-emerald-500 bg-emerald-500/10 shadow-xs" : "border-border bg-card hover:border-emerald-500/50"
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-emerald-500">🟢 Approved & Live</p>
          <p className="text-xl font-extrabold text-emerald-500 mt-1">{approvedCourses.length}</p>
        </button>
        <button
          onClick={() => setApprovalFilter("rejected")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            approvalFilter === "rejected" ? "border-red-500 bg-red-500/10 shadow-xs" : "border-border bg-card hover:border-red-500/50"
          }`}
        >
          <p className="text-[10px] uppercase font-bold text-red-500">🔴 Rejected</p>
          <p className="text-xl font-extrabold text-red-500 mt-1">{rejectedCourses.length}</p>
        </button>
      </div>

      <form onSubmit={saveCourse} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between"><div><h2 className="text-sm font-bold">{editingId ? "Edit Course" : "Add Course"}</h2><p className="mt-1 text-[10px] text-muted-foreground">Use one line per item for learning outcomes and requirements.</p></div>{editingId && <button type="button" onClick={resetForm} className="text-xs font-bold text-muted-foreground">Cancel edit</button>}</div>
        {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-500">{error}</div>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Course Title" value={form.title} required onChange={(value) => updateForm("title", value)} />
          <Field label="Instructor / Mentor (optional)" value={form.instructor} onChange={(value) => updateForm("instructor", value)} />
          <label className="space-y-1 text-[10px] font-bold uppercase text-muted-foreground md:col-span-2">Description<textarea required rows={3} value={form.description} onChange={(event) => updateForm("description", event.target.value)} className="course-field resize-none" /></label>
          <SelectField label="Category" value={form.category} options={["Software & Coding", "UI/UX & Product Design", "IELTS & English", "Freelancing & Career", "Data Science & AI", "Digital Marketing"]} onChange={(value) => updateForm("category", value)} />
          <div className="space-y-2 text-[10px] font-bold uppercase text-muted-foreground">
            <Field label="Thumbnail URL" value={form.thumbnail} placeholder="https://..." onChange={(value) => updateForm("thumbnail", value)} />
            <div className="flex items-center gap-3">
              <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-[10px] font-bold normal-case text-foreground hover:bg-accent">
                Upload image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => setThumbnailFile(event.target.files?.[0] || null)}
                />
              </label>
              <span className="truncate text-[10px] font-normal normal-case text-muted-foreground">
                {thumbnailFile?.name || "JPG, PNG, WebP or GIF, max 5 MB"}
              </span>
            </div>
            {(thumbnailFile || form.thumbnail) && (
              <img
                src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : form.thumbnail}
                alt="Thumbnail preview"
                className="h-20 w-32 rounded-lg object-cover"
              />
            )}
          </div>
          <Field label="Price (BDT)" value={form.price} type="number" onChange={(value) => updateForm("price", value)} />
          <SelectField label="Level" value={form.level} options={["Beginner", "Intermediate", "Advanced"]} onChange={(value) => updateForm("level", value)} />
          <Field label="Duration" value={form.duration} placeholder="e.g. 8 weeks" onChange={(value) => updateForm("duration", value)} />
          <TextAreaField label="What you'll learn" value={form.whatYouLearn} placeholder={'Build responsive interfaces\nDeploy a Next.js app'} onChange={(value) => updateForm("whatYouLearn", value)} />
          <TextAreaField label="Requirements" value={form.requirements} placeholder={'Basic JavaScript\nA laptop and internet'} onChange={(value) => updateForm("requirements", value)} />
          <TextAreaField label="Lessons" value={form.lessons} placeholder={'Introduction\nCore concepts\nFinal project'} onChange={(value) => updateForm("lessons", value)} />
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-4"><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={form.published} onChange={(event) => updateForm("published", event.target.checked)} /> Approve & Publish immediately</label><button disabled={saving} className="rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground disabled:opacity-50">{saving ? "Saving..." : editingId ? "Save Changes" : "Create Course"}</button></div>
      </form>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search courses or instructors..." className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-xs outline-none focus:border-primary" />
        <select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value)} className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs outline-none focus:border-primary">
          <option value="all">All Approval Statuses</option>
          <option value="pending">🟡 Pending Approval</option>
          <option value="approved">🟢 Approved & Live</option>
          <option value="rejected">🔴 Rejected</option>
        </select>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs outline-none focus:border-primary">
          <option value="all">All Categories</option>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center text-xs text-muted-foreground">No courses found.</div>
        ) : (
          filteredCourses.map((course) => {
            const isApproved = course.isApproved || course.approvalStatus === "approved";
            const isRejected = course.approvalStatus === "rejected";

            return (
              <article key={course.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="h-16 w-24 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-16 w-24 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">📚</div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="truncate text-sm font-bold">{course.title}</h3>
                        {isApproved ? (
                          <span className="rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 text-[8px] font-bold border border-emerald-500/20">
                            Approved & Published
                          </span>
                        ) : isRejected ? (
                          <span className="rounded-full bg-red-500/10 text-red-500 px-2 py-0.5 text-[8px] font-bold border border-red-500/20">
                            Rejected
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 text-amber-500 px-2 py-0.5 text-[8px] font-bold border border-amber-500/20 animate-pulse">
                            🟡 Pending Approval
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-1 text-[10px] text-muted-foreground">{course.description}</p>
                      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                        <span>{course.category}</span>
                        <span>{course.level}</span>
                        <span>৳{course.price.toLocaleString()} BDT</span>
                        <span>Mentor: <strong>{course.mentorName}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2 items-center">
                    {!isApproved && (
                      <button
                        type="button"
                        onClick={() => handleApprove(course)}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-emerald-600 shadow-xs"
                      >
                        ✓ Approve & Publish
                      </button>
                    )}
                    {!isRejected && (
                      <button
                        type="button"
                        onClick={() => handleReject(course)}
                        className="rounded-lg border border-red-500/30 text-red-500 px-3 py-1.5 text-[10px] font-bold hover:bg-red-500/10"
                      >
                        ✕ Reject
                      </button>
                    )}
                    <button type="button" onClick={() => editCourse(course)} className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-bold hover:bg-accent">
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteCourse(course)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required = false, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; placeholder?: string }) {
  return <label className="space-y-1 text-[10px] font-bold uppercase text-muted-foreground">{label}<input required={required} type={type} min={type === "number" ? "0" : undefined} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="course-field" /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="space-y-1 text-[10px] font-bold uppercase text-muted-foreground">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="course-field">{options.map((option) => <option key={option}>{option}</option>)}</select></label>;
}

function TextAreaField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (value: string) => void }) {
  return <label className="space-y-1 text-[10px] font-bold uppercase text-muted-foreground">{label}<textarea rows={4} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="course-field resize-none" /></label>;
}
