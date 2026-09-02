# SkillBridge

**SkillBridge** is a full-stack mentorship marketplace built for Bangladesh, connecting learners with verified industry experts through structured courses, 1-on-1 consultations, and peer-to-peer skill exchanges. It features a token-based economy, local mobile financial services (bKash, Nagad, Rocket), Google OAuth, a rewards system, and role-tailored dashboard experiences.

> This is a **University Software Development Project (SDP)** built as an academic prototype.

---

## Core Features

### For Learners
- **Course Catalog & Enrollment** — Browse industry-focused courses with multi-lesson video classrooms.
- **1-on-1 Mentorship Booking** — Schedule private consultation sessions using tokens or direct payment.
- **Peer-to-Peer Skill Exchange** — Barter your skills for free (teach what you know, learn what you need) or pay via tokens.
- **Token Economy** — Earn tokens by completing lessons (+10), quizzes (+20-30), and courses (+100). Redeem them for rewards or use them to enroll in courses.
- **Rewards Store** — Redeem tokens for discounts, certificates, learning packs, mentor passes, and scholar badges.
- **Learning Hub** — Track video lesson progress, completions, upcoming bookings, and exchange requests.
- **Subscription Plan** — All-Access plan (799 BDT/month) for unlimited course access.
- **Direct Messaging** — Chat in real-time with mentors and barter exchange partners.

### For Mentors
- **Mentor Studio & Course Builder** — Create and structure multi-lesson courses with thumbnail uploads and syllabus builder.
- **Admin Approval Workflow** — Submit courses for administrative review and quality verification.
- **Schedule Management** — Set custom weekly availability slots and hourly consultation rates in BDT.
- **Booking Oversight** — Review incoming student consultation requests (accept, reject, reschedule).
- **Earnings & Payouts** — Real-time revenue analytics, consultation fee tracking, and withdrawal via bKash/Nagad/Rocket/bank.

### For Administrators
- **Admin Dashboard** — Platform analytics, gross revenue metrics, and user growth charts.
- **Course Approvals & Moderation** — Review pending mentor course submissions with 1-click approval/rejection.
- **Mentor KYC Verification** — Review LinkedIn profiles and identity documents before granting verified status.
- **User Directory & Moderation** — Manage learner, mentor, and admin accounts with safe cascade deletion and role updates.
- **Financial & Payment Oversight** — Verify bKash/Nagad transactions, issue student refunds, and configure platform settings.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + Custom CSS Design System |
| **Database** | Neon Serverless PostgreSQL |
| **ORM** | Prisma 7 (`@prisma/adapter-pg` + `pg.Pool`) |
| **Authentication** | JWT Sessions + `httpOnly` Cookies + Google OAuth 2.0 + `bcryptjs` |
| **Email** | Resend API |
| **Deployment** | Vercel Serverless Platform |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/0ISHRAK/skillbridge.git
cd skillbridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=           # Neon PostgreSQL connection string
RESEND_API_KEY=         # Resend API key
RESEND_FROM=            # Verified sender email
GOOGLE_CLIENT_ID=       # Google OAuth client ID
GOOGLE_CLIENT_SECRET=   # Google OAuth client secret
GOOGLE_REDIRECT_URI=    # Google OAuth redirect URI
```

### 4. Sync Database Schema & Generate Prisma Client

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed Initial Data

```bash
npx tsx scripts/create-admin.ts
npx tsx scripts/seed-courses.ts
```

### 6. Start the Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## Project Architecture

```
skillbridge/
├── prisma/
│   ├── schema.prisma              # Database models & relations
│   └── prisma.config.ts           # Prisma configuration & env loader
├── scripts/
│   ├── create-admin.ts            # Admin user seeder
│   └── seed-courses.ts            # Starter courses & mentors seeder
├── public/
│   ├── logo.svg                   # Brand logo (SVG)
│   └── logo.png                   # Brand logo (PNG)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/             # Analytics, course moderation, users, refunds
│   │   │   ├── auth/              # Login, signup, OAuth, email verification, password reset
│   │   │   ├── courses/           # Public catalog, enrollments, progress
│   │   │   ├── mentor/            # Mentor studio, availability, earnings, bookings
│   │   │   ├── skill-exchange/    # Barter & token exchange proposals
│   │   │   ├── wallet/            # Token purchases (bKash/Nagad)
│   │   │   ├── subscription/      # All-Access subscription management
│   │   │   └── notifications/     # In-app notification engine
│   │   ├── about/                 # Mission, FAQ, contact support form
│   │   ├── admin/                 # Admin console (approvals, users, reports)
│   │   ├── auth/                  # Authentication & onboarding wizards
│   │   ├── dashboard/             # Learner hub & Mentor Studio
│   │   ├── explore/               # Search, filters & public catalog
│   │   ├── pricing/               # Subscription plans & token packs
│   │   ├── rewards/               # Token rewards store & voucher management
│   │   ├── skills/[id]/           # Course classroom & token checkout
│   │   └── mentors/[id]/          # Mentor profile & consultation booking
│   ├── components/
│   │   ├── Navbar.tsx             # Role-adaptive header with search, notifications, theme toggle
│   │   ├── Footer.tsx             # Responsive global footer with newsletter signup
│   │   └── ProjectDisclaimerModal.tsx  # Academic project disclaimer splash
│   ├── lib/
│   │   ├── db.ts                  # Prisma Client + PostgreSQL connection pool
│   │   ├── auth.ts                # JWT authentication & session utilities
│   │   ├── rewards.ts             # Token rewards engine & redemption logic
│   │   └── notifications.ts       # In-app notification dispatcher
│   └── proxy.ts                   # CORS headers & IP-based rate limiting
└── README.md
```

---

## Database Models

| Model | Purpose |
|---|---|
| **User** | Accounts with role (admin/mentor/learner), token balance, subscription status |
| **Course** | Multi-lesson courses with approval workflow and pricing |
| **Lesson** | Individual video lessons within courses |
| **Enrollment** | Learner-course enrollment tracking |
| **Booking** | 1-on-1 consultation session scheduling |
| **SkillExchange** | Peer-to-peer barter skill proposals |
| **Reward** | Redeemable items in the rewards store |
| **RewardRedemption** | Tracks user reward claims with voucher codes |
| **TokenTransaction** | Token ledger (earnings, spending, balance history) |
| **QuizAttempt** | Quiz scores, pass/fail, and tokens awarded |
| **PayoutRequest** | Mentor withdrawal requests via MFS or bank |
| **Notification** | In-app notification records |

---

## Token & Rewards Economy

- **25 Free Tokens** granted on signup.
- **Exchange Rate**: 1 Token = 10 BDT.
- **Earning Tokens**: Complete lessons (+10), pass quizzes (+20-30), finish courses (+100).
- **Spending Tokens**: Enroll in courses, book consultations, or redeem rewards.
- **Rewards Store**: Discounts, certificate upgrades, learning packs, challenge entries, mentor passes, and scholar badges.
- **Zero-Cost Skill Barter**: Exchange equivalent skills without spending tokens or money.

---

## Authentication

- **Email/Password** — Server-side JWT sessions with `httpOnly` secure cookies.
- **Google OAuth 2.0** — One-click sign-in via Google account.
- **Email Verification** — OTP-based email confirmation on signup.
- **Password Recovery** — Forgot password and reset password flows via email.
- **3-Step Onboarding** — Role selection, profile setup, and interest configuration.

---

## Payments

All payments use simulated Bangladeshi mobile financial services:

- **bKash** — Phone number + OTP + PIN verification flow.
- **Nagad** — Phone number + OTP + PIN verification flow.
- **Rocket** — Phone number + OTP + PIN verification flow.

Token packs available:
| Pack | Tokens | Price |
|---|---|---|
| Starter | 50 | 500 BDT |
| Accelerator | 120 | 1,000 BDT |
| Professional | 320 | 2,500 BDT |

---

## Production Deployment (Vercel)

1. Import the repository into [Vercel](https://vercel.com).
2. Add all environment variables from the `.env.local` template in project settings.
3. Deploy — Vercel automatically runs `postinstall: "prisma generate"` and builds all routes.

---

## Rate Limiting

API routes are protected with IP-based rate limiting (100 requests/minute per IP) via the proxy middleware, with bilingual error messages (English + Bengali).
