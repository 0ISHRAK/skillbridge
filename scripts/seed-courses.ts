import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/client";
import bcrypt from "bcryptjs";
import path from "path";

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), "dev.db")}`,
});
const prisma = new PrismaClient({ adapter });

const courses = [
  {
    title: "MERN Stack Development for Freelancing",
    description:
      "Master MongoDB, Express, React, and Node.js to build full-stack web apps for Upwork and Fiverr clients. Covers REST APIs, authentication, deployment on Railway/Vercel, and proposal writing tips.",
    category: "Software & Coding",
    price: 2500,
    lessons: [
      { id: "l1", title: "Introduction to MERN Stack", duration: "45 min" },
      { id: "l2", title: "Setting Up Node.js & Express", duration: "60 min" },
      { id: "l3", title: "MongoDB Schema Design", duration: "55 min" },
      { id: "l4", title: "Building REST APIs", duration: "75 min" },
      { id: "l5", title: "React Fundamentals & Hooks", duration: "80 min" },
      { id: "l6", title: "Connecting Frontend to Backend", duration: "65 min" },
      { id: "l7", title: "JWT Authentication", duration: "60 min" },
      { id: "l8", title: "File Uploads & Cloud Storage", duration: "50 min" },
      { id: "l9", title: "Deployment on Railway & Vercel", duration: "45 min" },
      { id: "l10", title: "Freelancing Strategy & Proposal Writing", duration: "40 min" },
    ],
  },
  {
    title: "Figma UI/UX Design Bootcamp",
    description:
      "Learn Figma from scratch to professional level. Covers wireframing, high-fidelity UI design, design systems, prototyping, and handing off designs to developers. Includes real project walkthroughs.",
    category: "UI/UX & Product Design",
    price: 1800,
    lessons: [
      { id: "l1", title: "Figma Interface & Navigation", duration: "30 min" },
      { id: "l2", title: "Wireframing Fundamentals", duration: "50 min" },
      { id: "l3", title: "Typography & Color Theory", duration: "45 min" },
      { id: "l4", title: "Component & Auto Layout", duration: "65 min" },
      { id: "l5", title: "Building a Design System", duration: "80 min" },
      { id: "l6", title: "High-Fidelity Mobile UI", duration: "70 min" },
      { id: "l7", title: "Prototyping & Interactions", duration: "55 min" },
      { id: "l8", title: "UX Research & User Flows", duration: "50 min" },
      { id: "l9", title: "Developer Handoff with Figma", duration: "40 min" },
    ],
  },
  {
    title: "IELTS Speaking & Writing Band 7+ Prep",
    description:
      "Targeted IELTS preparation for Bangladeshi students aiming for Band 7 or above. Covers Speaking Part 1-3 strategies, Writing Task 1 & 2 templates, common mistakes, and mock test practice with feedback.",
    category: "IELTS & Communication",
    price: 1200,
    lessons: [
      { id: "l1", title: "Understanding IELTS Band Scoring", duration: "30 min" },
      { id: "l2", title: "Speaking Part 1: Personal Questions", duration: "45 min" },
      { id: "l3", title: "Speaking Part 2: Cue Card Strategies", duration: "50 min" },
      { id: "l4", title: "Speaking Part 3: Discussion Techniques", duration: "45 min" },
      { id: "l5", title: "Writing Task 1: Graphs & Charts", duration: "60 min" },
      { id: "l6", title: "Writing Task 2: Essay Structures", duration: "65 min" },
      { id: "l7", title: "Common Grammar Mistakes & Fixes", duration: "40 min" },
      { id: "l8", title: "Mock Test Practice & Feedback", duration: "90 min" },
    ],
  },
  {
    title: "Upwork & Fiverr Freelancing Masterclass",
    description:
      "Complete A-to-Z guide to building a successful freelancing career on Upwork and Fiverr. Covers profile optimization, proposal writing, client communication, pricing strategy, and handling payments from Bangladesh.",
    category: "Freelancing & Career",
    price: 1500,
    lessons: [
      { id: "l1", title: "Freelancing Mindset & Goal Setting", duration: "35 min" },
      { id: "l2", title: "Creating a Winning Upwork Profile", duration: "55 min" },
      { id: "l3", title: "Setting Up Fiverr Gigs that Convert", duration: "50 min" },
      { id: "l4", title: "Writing Proposals that Get Responses", duration: "60 min" },
      { id: "l5", title: "Pricing Strategy & Packages", duration: "40 min" },
      { id: "l6", title: "Client Communication & Onboarding", duration: "45 min" },
      { id: "l7", title: "Handling Revisions & Difficult Clients", duration: "40 min" },
      { id: "l8", title: "Receiving Payments via bKash/Bank", duration: "35 min" },
      { id: "l9", title: "Scaling to $1,000+/month", duration: "50 min" },
    ],
  },
  {
    title: "Advanced Next.js 16 & Tailwind CSS v4",
    description:
      "Deep dive into Next.js 16 App Router, React Server Components, Server Actions, Prisma ORM, and Tailwind CSS v4. Build production-ready full-stack applications with authentication, file uploads, and deployment.",
    category: "Software & Coding",
    price: 3000,
    lessons: [
      { id: "l1", title: "Next.js 16 App Router Overview", duration: "50 min" },
      { id: "l2", title: "React Server Components vs Client Components", duration: "65 min" },
      { id: "l3", title: "Server Actions & Form Handling", duration: "60 min" },
      { id: "l4", title: "Tailwind CSS v4 Config & Theming", duration: "55 min" },
      { id: "l5", title: "Prisma ORM with SQLite & Postgres", duration: "70 min" },
      { id: "l6", title: "JWT Auth with httpOnly Cookies", duration: "65 min" },
      { id: "l7", title: "File Uploads & Storage", duration: "50 min" },
      { id: "l8", title: "API Routes & Middleware", duration: "55 min" },
      { id: "l9", title: "Deployment on Vercel & Railway", duration: "45 min" },
      { id: "l10", title: "Performance Optimization & SEO", duration: "50 min" },
    ],
  },
  {
    title: "Digital Marketing & SEO for Bangladeshi Businesses",
    description:
      "Learn how to grow a business online using SEO, Facebook Ads, Google Ads, and content marketing. Practical course tailored for local Bangladeshi businesses and freelancers targeting international clients.",
    category: "Digital Marketing",
    price: 2000,
    lessons: [
      { id: "l1", title: "Digital Marketing Fundamentals", duration: "40 min" },
      { id: "l2", title: "SEO Basics: Keywords & On-Page", duration: "60 min" },
      { id: "l3", title: "Technical SEO & Site Audit", duration: "55 min" },
      { id: "l4", title: "Content Marketing Strategy", duration: "50 min" },
      { id: "l5", title: "Facebook Ads for BD Market", duration: "65 min" },
      { id: "l6", title: "Google Ads & PPC Campaigns", duration: "60 min" },
      { id: "l7", title: "Social Media Growth Strategy", duration: "45 min" },
      { id: "l8", title: "Email Marketing & Lead Generation", duration: "50 min" },
      { id: "l9", title: "Analytics & Measuring ROI", duration: "45 min" },
    ],
  },
  {
    title: "Product Management for Tech Startups",
    description:
      "Learn product discovery, roadmap planning, writing PRDs, running sprints, and measuring success with analytics. Designed for aspiring PMs at Bangladeshi startups and tech companies.",
    category: "Freelancing & Career",
    price: 4000,
    lessons: [
      { id: "l1", title: "What Does a PM Actually Do?", duration: "35 min" },
      { id: "l2", title: "User Research & Persona Building", duration: "55 min" },
      { id: "l3", title: "Writing PRDs & User Stories", duration: "65 min" },
      { id: "l4", title: "Roadmap Planning & Prioritization", duration: "60 min" },
      { id: "l5", title: "Agile & Scrum for PMs", duration: "55 min" },
      { id: "l6", title: "Working with Designers & Engineers", duration: "50 min" },
      { id: "l7", title: "KPIs, Metrics & OKRs", duration: "50 min" },
      { id: "l8", title: "A/B Testing & Feature Launches", duration: "45 min" },
      { id: "l9", title: "PM Interview Preparation", duration: "60 min" },
    ],
  },
  {
    title: "Study Abroad Counselling: UK, Canada & Australia",
    description:
      "Step-by-step guidance for Bangladeshi students applying to universities in UK, Canada, and Australia. Covers university selection, SOP writing, scholarship search, visa process, and pre-departure checklist.",
    category: "Higher Study Abroad",
    price: 2200,
    lessons: [
      { id: "l1", title: "Why Study Abroad? BD Student Reality Check", duration: "30 min" },
      { id: "l2", title: "Choosing the Right Country & University", duration: "55 min" },
      { id: "l3", title: "Eligibility & English Requirements", duration: "40 min" },
      { id: "l4", title: "Writing a Winning Statement of Purpose", duration: "70 min" },
      { id: "l5", title: "Scholarship Opportunities for BD Students", duration: "55 min" },
      { id: "l6", title: "Application Timeline & Checklist", duration: "45 min" },
      { id: "l7", title: "Student Visa Process (UK/Canada/AUS)", duration: "60 min" },
      { id: "l8", title: "Pre-Departure: Accommodation & Banking", duration: "40 min" },
    ],
  },
];

async function main() {
  // Find or create a mentor to own these courses
  let mentor = await prisma.user.findFirst({
    where: { role: "mentor", isMentorApproved: true },
  });

  if (!mentor) {
    console.log("No approved mentor found. Creating a demo mentor...");
    const hashed = await bcrypt.hash("mentor123", 10);
    mentor = await prisma.user.create({
      data: {
        email: "tanzim@skillbridge.com",
        password: hashed,
        name: "Tanzim Hasan",
        role: "mentor",
        isEmailVerified: true,
        isMentorApproved: true,
        tokenBalance: 0,
        hourlyRate: 1500,
        bio: "Senior Software Engineer at TigerIT. BUET '18. 6+ years of experience in full-stack development.",
        skills: JSON.stringify(["React", "Node.js", "Next.js", "System Design", "MongoDB"]),
        availabilityDays: JSON.stringify(["Monday", "Wednesday", "Friday", "Saturday"]),
        isOnboarded: true,
      },
    });
    console.log(`✅ Created mentor: ${mentor.email}`);
  } else {
    console.log(`✅ Using existing mentor: ${mentor.email} (${mentor.name})`);
  }

  let created = 0;
  let skipped = 0;

  for (const course of courses) {
    const existing = await prisma.course.findFirst({
      where: { title: course.title, mentorId: mentor!.id },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.course.create({
      data: {
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        published: true,
        lessons: JSON.stringify(course.lessons),
        mentorId: mentor!.id,
        mentorName: mentor!.name,
      },
    });
    created++;
    console.log(`  ✓ "${course.title}" (৳${course.price})`);
  }

  console.log(`\n✅ Done: ${created} course(s) added, ${skipped} skipped (already exist).`);
  console.log(`   View them at: http://localhost:3000/explore\n`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
