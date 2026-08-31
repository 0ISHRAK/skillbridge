# 🚀 SkillBridge

**SkillBridge** is a modern, full-stack mentorship marketplace designed for Bangladesh, connecting learners with verified industry experts for structured courses, 1-on-1 consultations, and peer-to-peer barter skill exchanges. Built with a unified token-based economy, local mobile financial services (bKash, Nagad, Rocket), and role-tailored dashboard experiences.

---

## 🌟 Core Features

### 📚 For Learners
- **Course Catalog & Enrollment**: Browse industry-focused courses with multi-lesson video classrooms.
- **1-on-1 Mentorship Booking**: Schedule private consultation sessions using tokens or direct payment.
- **🔄 Peer-to-Peer Skill Exchange**: Barter your skills for free (teach what you know, learn what you need) or pay via tokens.
- **Token Economy**: Standardized rate (1 Token = ৳10 BDT) for seamless course enrollment and booking.
- **Learning Hub**: Track video lesson progress, completions, upcoming bookings, and exchange requests.
- **Direct Messaging**: Chat in real-time with mentors and barter exchange partners.

### 🎓 For Mentors
- **Mentor Studio & Course Builder**: Create and structure multi-lesson courses with thumbnail uploads and syllabus builder.
- **Admin Approval Workflow**: Submit courses for administrative review and quality verification.
- **Schedule Management**: Set custom weekly availability slots and hourly consultation rates in BDT.
- **Booking Oversight**: Review incoming student consultation requests (accept, reject, reschedule).
- **Earnings & Payouts**: Real-time revenue analytics, consultation fee tracking, and withdrawal management.

### 🛡️ For Administrators
- **Comprehensive Admin Dashboard**: Platform analytics, gross revenue metrics, and user growth charts.
- **Course Approvals & Catalog Moderation**: Review pending mentor course submissions with 1-click approval/rejection.
- **Mentor KYC Verification**: Review LinkedIn profiles and identity documents before granting verified status.
- **User Directory & Moderation**: Manage learner, mentor, and admin accounts with safe cascade deletion and role updates.
- **Financial & Payment Oversight**: Verify bKash/Nagad transactions, issue student refunds, and configure platform settings.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Design System |
| **Database** | Neon Serverless PostgreSQL |
| **ORM** | Prisma 7 (`@prisma/adapter-pg` + `pg.Pool`) |
| **Authentication** | Server-side JWT sessions + `httpOnly` secure cookies + `bcryptjs` |
| **Email Delivery** | Resend API (`resend` SDK) |
| **Deployment** | Vercel Serverless Platform |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dev70AIS1/skillbridge.git
cd skillbridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` or `.env.local` file in your root directory and configure your `DATABASE_URL` (PostgreSQL connection string), `RESEND_API_KEY`, and `RESEND_FROM` email sender.

### 4. Sync Database Schema & Generate Prisma Client

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed Initial Data (Admin & Courses)

```bash
# Seed default admin account
npx tsx scripts/create-admin.ts

# Seed initial courses and mentors
npx tsx scripts/seed-courses.ts
```

### 6. Start the Development Server

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📁 Project Architecture

```
skillbridge/
├── prisma/
│   ├── schema.prisma              # PostgreSQL database models & relations
│   └── prisma.config.ts           # Prisma 7 configuration & environment loader
├── scripts/
│   ├── create-admin.ts            # Admin user seeder
│   └── seed-courses.ts            # Starter courses & mentors seeder
├── src/
│   ├── app/
│   │   ├── api/                   # Serverless API Routes
│   │   │   ├── admin/             # Analytics, course moderation, users, refunds
│   │   │   ├── auth/              # Login, signup, verify-email, onboarding, me
│   │   │   ├── courses/           # Public catalog, enrollments, progress
│   │   │   ├── mentor/            # Mentor studio, availability, earnings, bookings
│   │   │   ├── skill-exchange/    # Barter & token exchange proposals
│   │   │   ├── wallet/            # Token purchases (bKash/Nagad)
│   │   │   └── notifications/     # Real-time in-app notification engine
│   │   ├── admin/                 # Admin console pages (approvals, users, reports)
│   │   ├── auth/                  # Authentication & 3-step onboarding wizards
│   │   ├── dashboard/             # Learner hubs & Mentor Studio
│   │   ├── explore/               # Search, filters & public catalog
│   │   ├── skills/[id]/           # Course classroom details & token checkout
│   │   └── mentors/[id]/          # Mentor profile & consultation booking
│   ├── components/
│   │   ├── Navbar.tsx             # Role-adaptive header (Admin, Mentor, Learner, Guest)
│   │   └── Footer.tsx             # Responsive global footer
│   └── lib/
│       ├── db.ts                  # Prisma Client + PostgreSQL connection pool
│       ├── auth.ts                # JWT authentication & session utilities
│       └── notifications.ts       # In-app notification dispatcher
└── README.md
```

---

## 🪙 Token & Economic Model

- **100 Free Tokens** granted on new user signups.
- **Standardized Exchange Rate**: 1 Token = ৳10 BDT (`course.price / 10`).
- **Flexible Enrollment**: Users can enroll in courses using either Token Balance or Cash via simulated local MFS (bKash, Nagad, Rocket).
- **Zero-Cost Skill Barter**: Users can exchange equivalent skills without spending any tokens or money.

---

## 🚢 Production Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com).
2. Add the following **Environment Variables** in Vercel project settings:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `RESEND_API_KEY`: Your Resend API key
   - `RESEND_FROM`: Verified sender email
3. Deploy! Vercel automatically runs `postinstall: "prisma generate"` and builds all routes.
