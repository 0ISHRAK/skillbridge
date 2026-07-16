# SkillBridge

A mentorship marketplace for Bangladesh connecting learners with verified industry mentors for structured courses and 1-on-1 consultation sessions. Built with a token-based economy and local mobile payment support (bKash / Nagad / Rocket).

---

## Features

### For Learners
- Browse and enroll in courses from verified mentors
- Book 1-on-1 consultation sessions using Skill Tokens
- **Skill Exchange** — post a skill you can teach, get a skill you want to learn (free barter or token-paid)
- Monthly All-Access subscription to unlock all courses
- Track course progress and session history
- In-app messaging with mentors

### For Mentors
- Create and publish courses with lesson content
- Set weekly availability and hourly rate
- Manage incoming session bookings (confirm / reject / reschedule)
- Track earnings and reviews
- Skill Exchange participation

### Platform
- Admin panel — user management, mentor verification, booking oversight, refunds, analytics
- JWT authentication with httpOnly cookies
- Email OTP verification (Nodemailer SMTP, console fallback in dev)
- Forgot / reset password flow
- In-app notification system
- Dark / light theme
- Smart hide-on-scroll navbar
- Personalized home page for logged-in users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 + better-sqlite3 |
| Database | SQLite (`dev.db`) |
| Auth | jsonwebtoken + bcryptjs |
| Email | Nodemailer |
| Runtime | Node.js 20+ |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/AISGHOST12/skillbridge.git
cd skillbridge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
JWT_SECRET=your-secret-key-here

# Optional: real email sending (falls back to console log in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
```

### 4. Set up the database

```bash
npx prisma db push
npx prisma generate
```

### 5. (Optional) Create an admin account

```bash
npx tsx scripts/create-admin.ts
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
skillbridge/
├── prisma/
│   └── schema.prisma          # Database schema
├── scripts/
│   ├── create-admin.ts        # Seed an admin user
│   └── seed-courses.ts        # Seed sample courses
├── src/
│   ├── app/
│   │   ├── api/               # All API routes (Next.js Route Handlers)
│   │   │   ├── auth/          # login, signup, verify-email, forgot-password
│   │   │   ├── courses/       # CRUD, enroll, progress
│   │   │   ├── bookings/      # Student booking management
│   │   │   ├── mentor/        # Mentor-side booking, earnings, courses
│   │   │   ├── messages/      # Direct messaging
│   │   │   ├── notifications/ # In-app notifications
│   │   │   ├── skill-posts/   # Skill Exchange posts
│   │   │   ├── skill-exchange/# Exchange requests & responses
│   │   │   ├── subscription/  # All-Access subscription
│   │   │   └── admin/         # Admin panel APIs
│   │   ├── auth/              # Login, signup, OTP verify, onboarding pages
│   │   ├── dashboard/         # Learner & mentor dashboard pages
│   │   ├── explore/           # Browse courses, mentors, skill exchange
│   │   ├── skills/[id]/       # Course detail & enrollment
│   │   ├── pricing/           # Token packs & subscription
│   │   └── admin/             # Admin panel pages
│   ├── components/
│   │   └── Navbar.tsx
│   ├── lib/
│   │   ├── auth.ts            # JWT helpers
│   │   ├── db.ts              # Prisma client singleton
│   │   └── notifications.ts   # Notification + email helpers
│   └── proxy.ts               # Rate limiting + CORS (Next.js 16 middleware)
└── .env                       # Local env vars (not committed)
```

---

## Data Models

| Model | Purpose |
|---|---|
| `User` | Learners, mentors, admins |
| `Course` | Published courses with lesson content |
| `Enrollment` | Learner ↔ course relationship + progress |
| `Booking` | 1-on-1 session requests |
| `Payment` | Token purchases + subscription payments |
| `Message` | Direct messages between users |
| `Notification` | In-app alerts |
| `Review` | Ratings for courses and mentors |
| `SkillPost` | Skill Exchange offers |
| `SkillExchangeRequest` | Requests to a SkillPost (barter or token) |

---

## Token Economy

- **30 free tokens** on signup
- Token packs: Starter (10), Accelerator (30), Pro (100) — paid via bKash / Nagad / Rocket
- Courses cost tokens on enrollment
- Sessions cost tokens on booking
- **All-Access subscription** (৳799/month) unlocks all courses for free
- **Skill Exchange** — barter your skill for another user's skill at zero token cost

---

## Skill Exchange

A peer-to-peer learning feature unique to SkillBridge:

1. A user posts a skill they can teach + a skill they want in return
2. If another user has the requested skill → **free barter** (both teach each other)
3. If a user doesn't have the requested skill but wants to learn → **token exchange** (pays the post's token cost)
4. Post author accepts or declines incoming requests
5. Token refund is automatic on rejection

---

## Development Notes

- OTP verification accepts **any 6-digit code** in dev/sandbox mode
- Payments are **simulated** (bKash/Nagad/Rocket mock flow)
- Email falls back to **console log** if SMTP is not configured
- Run `npx prisma db push` after any schema change
- Run `npx prisma generate` after `db push`, then restart the dev server

---

## Team

Built as a Software Development Project (SDP) at university.

| Name | Role |
|---|---|
| MD Raduan Abdullah Ishrak | Lead Developer |

---

## License

MIT
