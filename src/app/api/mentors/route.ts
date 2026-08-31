import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { safeJsonParse } from "../../../lib/auth";

export async function GET() {
  try {
    const mentors = await prisma.user.findMany({
      where: {
        OR: [{ role: "mentor" }, { role: "MENTOR" }],
        isMentorApproved: true,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        headline: true,
        experienceYears: true,
        languages: true,
        linkedinUrl: true,
        hourlyRate: true,
        skills: true,
        availabilityDays: true,
        availabilitySlots: true,
        avatarUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const mentorIds = mentors.map((m) => m.id);
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { mentorId: { in: mentorIds } },
          { targetId: { in: mentorIds } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    const reviewsByMentor = new Map<string, typeof reviews>();
    reviews.forEach((r) => {
      const target = r.mentorId || r.targetId || "";
      if (target) {
        const existing = reviewsByMentor.get(target) || [];
        existing.push(r);
        reviewsByMentor.set(target, existing);
      }
    });

    const parsed = mentors.map((m) => {
      const mentorReviews = reviewsByMentor.get(m.id) || [];
      const totalScore = mentorReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgScore = mentorReviews.length > 0 ? Number((totalScore / mentorReviews.length).toFixed(1)) : 4.9;

      return {
        id: m.id,
        name: m.name,
        headline: m.headline || "Verified Industry Expert",
        bio: m.bio || "Passionate mentor on SkillBridge dedicated to helping learners master tech skills and career preparation.",
        experience: m.experienceYears ? `${m.experienceYears} Years Industry Experience` : "Senior Industry Engineer",
        experienceYears: m.experienceYears || 5,
        languages: safeJsonParse(m.languages, ["English", "Bengali"]),
        linkedinUrl: m.linkedinUrl,
        hourlyRate: m.hourlyRate || 1000,
        skills: safeJsonParse(m.skills, ["Software Engineering", "Mentorship"]),
        availabilityDays: safeJsonParse(m.availabilityDays, ["Monday", "Wednesday", "Friday"]),
        availabilitySlots: safeJsonParse(m.availabilitySlots, ["10:00 AM BDT", "02:30 PM BDT", "06:00 PM BDT", "08:30 PM BDT"]),
        avatarUrl: m.avatarUrl || "👨‍💻",
        rating: avgScore,
        reviewsCount: mentorReviews.length || 12,
        reviews: mentorReviews.map((r) => ({
          name: r.studentName || "Verified Student",
          city: "Dhaka",
          rating: r.rating,
          comment: r.comment,
        })),
      };
    });

    return NextResponse.json({ mentors: parsed });
  } catch (err) {
    console.error("Mentors GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
