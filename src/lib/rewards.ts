import { prisma } from "./db";
import crypto from "crypto";

export interface DefaultRewardItem {
  id: string;
  title: string;
  description: string;
  tokenCost: number;
  type: string;
  icon: string;
  isActive: boolean;
  isOneTime: boolean;
  discountValue?: number;
  badge?: string;
}

export const INITIAL_REWARDS: DefaultRewardItem[] = [
  {
    id: "reward-course-discount-20",
    title: "Premium Course Discount (20% OFF)",
    description: "Get 20% off any premium mentorship course or live workshop enrollment voucher.",
    tokenCost: 40,
    type: "discount",
    icon: "🎟️",
    isActive: true,
    isOneTime: false,
    discountValue: 20,
    badge: "Popular",
  },
  {
    id: "reward-cert-upgrade",
    title: "Verified Certificate Upgrade",
    description: "Upgrade your course completion certificate with a verifiable digital credential & QR validation code.",
    tokenCost: 60,
    type: "certificate",
    icon: "📜",
    isActive: true,
    isOneTime: false,
    badge: "Official",
  },
  {
    id: "reward-learning-pack",
    title: "Special Learning Resource Pack",
    description: "Complete curated developer & designer pack including project source code templates, cheatsheets, and interview prep guides.",
    tokenCost: 80,
    type: "learning_pack",
    icon: "📦",
    isActive: true,
    isOneTime: false,
    badge: "Best Value",
  },
  {
    id: "reward-exclusive-challenge",
    title: "Exclusive Industry Project Challenge",
    description: "Gain entry to high-tier real-world challenge briefs with priority code reviews from senior industry mentors.",
    tokenCost: 100,
    type: "challenge",
    icon: "⚡",
    isActive: true,
    isOneTime: false,
    badge: "Exclusive",
  },
  {
    id: "reward-mentor-voucher",
    title: "1-on-1 Mentor Consultation Pass",
    description: "Voucher for a 30-minute 1-on-1 strategy and code review session with any verified mentor.",
    tokenCost: 120,
    type: "mentorship",
    icon: "👨‍🏫",
    isActive: true,
    isOneTime: false,
    badge: "Premium",
  },
  {
    id: "reward-scholar-badge",
    title: "Verified Scholar Profile Badge",
    description: "Highlight your profile and skill exchange requests with a gold 'Verified Scholar' achievement badge.",
    tokenCost: 30,
    type: "badge",
    icon: "🏅",
    isActive: true,
    isOneTime: true,
    badge: "Achievement",
  },
];

/**
 * Seed or calibrate default rewards catalog in the database.
 */
export async function seedDefaultRewardsIfNeeded() {
  try {
    for (const item of INITIAL_REWARDS) {
      await prisma.reward.upsert({
        where: { id: item.id },
        update: {
          tokenCost: item.tokenCost,
          title: item.title,
          description: item.description,
          type: item.type,
          icon: item.icon,
          badge: item.badge,
        },
        create: {
          id: item.id,
          title: item.title,
          description: item.description,
          tokenCost: item.tokenCost,
          type: item.type,
          icon: item.icon,
          isActive: item.isActive,
          isOneTime: item.isOneTime,
          discountValue: item.discountValue,
          badge: item.badge,
        },
      });
    }
  } catch (err) {
    console.error("Error seeding default rewards:", err);
  }
}

/**
 * Awards learning tokens to a user with strict deduplication checking.
 */
export async function awardLearningTokens({
  userId,
  amount,
  type,
  title,
  description,
  referenceId,
}: {
  userId: string;
  amount: number;
  type: string;
  title: string;
  description?: string;
  referenceId?: string;
}) {
  if (amount <= 0) return { awarded: false, reason: "invalid_amount", newBalance: 0 };

  // Anti-abuse check: prevent rewarding twice for the same unique action if referenceId is provided
  if (referenceId) {
    const existingTx = await prisma.tokenTransaction.findFirst({
      where: {
        userId,
        referenceId,
        type,
      },
    });

    if (existingTx) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
      });
      return {
        awarded: false,
        reason: "already_claimed",
        newBalance: user?.tokenBalance ?? 0,
        transaction: existingTx,
      };
    }
  }

  // Atomically update user balance and record transaction
  const [updatedUser, transaction] = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { increment: amount },
      },
      select: { tokenBalance: true },
    });

    const tokenTx = await tx.tokenTransaction.create({
      data: {
        userId,
        amount,
        type,
        title,
        description: description || `Earned ${amount} tokens for ${title.toLowerCase()}`,
        referenceId: referenceId || null,
        balanceAfter: user.tokenBalance,
      },
    });

    // Create an in-app notification for the user
    await tx.notification.create({
      data: {
        userId,
        title: `🪙 +${amount} Learning Tokens Earned!`,
        content: `Great job! You earned ${amount} tokens: ${title}`,
        link: "/dashboard/rewards",
      },
    });

    return [user, tokenTx];
  });

  return {
    awarded: true,
    amount,
    newBalance: updatedUser.tokenBalance,
    transaction,
  };
}

/**
 * Deducts tokens atomically to redeem a reward.
 */
export async function redeemReward({
  userId,
  rewardId,
  metadata,
}: {
  userId: string;
  rewardId: string;
  metadata?: Record<string, unknown>;
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch user and verify balance
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, tokenBalance: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Fetch reward and verify it exists and is active
    const reward = await tx.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      throw new Error("Reward is no longer available or inactive");
    }

    // 3. Check one-time redemption restriction
    if (reward.isOneTime) {
      const existingRedemption = await tx.rewardRedemption.findFirst({
        where: { userId, rewardId },
      });
      if (existingRedemption) {
        throw new Error("You have already claimed this one-time reward");
      }
    }

    // 4. Validate sufficient balance
    if (user.tokenBalance < reward.tokenCost) {
      throw new Error(
        `Insufficient tokens. You have ${user.tokenBalance} tokens, but this reward costs ${reward.tokenCost} tokens.`
      );
    }

    // 5. Generate unique redemption voucher code
    const prefix = reward.type.substring(0, 4).toUpperCase();
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    const redemptionCode = `SB-${prefix}-${randomHex}`;

    // 6. Deduct balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        tokenBalance: { decrement: reward.tokenCost },
      },
      select: { tokenBalance: true },
    });

    // 7. Create redemption record
    const redemption = await tx.rewardRedemption.create({
      data: {
        rewardId: reward.id,
        userId: user.id,
        tokensSpent: reward.tokenCost,
        redemptionCode,
        status: "active",
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
      include: {
        reward: true,
      },
    });

    // 8. Create token transaction log (-tokenCost)
    const transaction = await tx.tokenTransaction.create({
      data: {
        userId: user.id,
        amount: -reward.tokenCost,
        type: "reward_redemption",
        title: `Redeemed: ${reward.title}`,
        description: `Voucher Code: ${redemptionCode}`,
        referenceId: redemption.id,
        balanceAfter: updatedUser.tokenBalance,
      },
    });

    // 9. Notify user
    await tx.notification.create({
      data: {
        userId: user.id,
        title: `🎉 Reward Claimed: ${reward.title}`,
        content: `Your redemption code is: ${redemptionCode}. You spent ${reward.tokenCost} tokens.`,
        link: "/dashboard/rewards",
      },
    });

    return {
      success: true,
      redemption,
      transaction,
      newBalance: updatedUser.tokenBalance,
      redemptionCode,
    };
  });
}

/**
 * Course Lesson Quizzes database / catalog with questions, options, and explanations.
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonQuiz {
  quizId: string;
  lessonId: string;
  title: string;
  passingPercentage: number;
  questions: QuizQuestion[];
}

const QUIZ_CATALOG: Record<string, LessonQuiz> = {
  "mern-1": {
    quizId: "q-mern-1",
    lessonId: "mern-1",
    title: "Course Setup & Client-Server Architecture Quiz",
    passingPercentage: 70,
    questions: [
      {
        id: "q1",
        question: "What does the MERN stack stand for?",
        options: [
          "MySQL, Express, React, Next.js",
          "MongoDB, Express, React, Node.js",
          "MariaDB, Ember, Ruby, Nginx",
          "MongoDB, Electron, Redux, Node.js",
        ],
        correctIndex: 1,
        explanation: "MERN stands for MongoDB, Express.js, React.js, and Node.js.",
      },
      {
        id: "q2",
        question: "Which component in the MERN stack acts as the runtime environment for JavaScript on the server?",
        options: ["React", "Express", "Node.js", "MongoDB"],
        correctIndex: 2,
        explanation: "Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser.",
      },
      {
        id: "q3",
        question: "What protocol is commonly used for client-server communication in standard REST APIs?",
        options: ["FTP", "SMTP", "HTTP / HTTPS", "SSH"],
        correctIndex: 2,
        explanation: "REST APIs use HTTP/HTTPS request methods (GET, POST, PUT, DELETE) to transfer data.",
      },
    ],
  },
  "mern-2": {
    quizId: "q-mern-2",
    lessonId: "mern-2",
    title: "Understanding Client-Server Model Quiz",
    passingPercentage: 70,
    questions: [
      {
        id: "q1",
        question: "Which HTTP status code signifies a successful request?",
        options: ["200 OK", "404 Not Found", "500 Internal Server Error", "301 Moved"],
        correctIndex: 0,
        explanation: "HTTP 200 indicates that the client's request was successfully processed.",
      },
      {
        id: "q2",
        question: "What is CORS primarily designed for?",
        options: [
          "Speeding up image rendering",
          "Restricting resource sharing between different origins in web browsers for security",
          "Encrypting database passwords",
          "Compressing API responses",
        ],
        correctIndex: 1,
        explanation: "Cross-Origin Resource Sharing (CORS) is a security mechanism that allows or restricts resources on a web server from being requested from another domain.",
      },
    ],
  },
  "mern-3": {
    quizId: "q-mern-3",
    lessonId: "mern-3",
    title: "React State & Props Masterclass Quiz",
    passingPercentage: 70,
    questions: [
      {
        id: "q1",
        question: "In React, how do props differ from state?",
        options: [
          "Props are mutable by the receiving component, state is immutable",
          "Props are passed down from parent components, while state is managed internally by the component",
          "Props only work with class components",
          "State cannot cause a component re-render",
        ],
        correctIndex: 1,
        explanation: "Props are read-only inputs passed from parent to child, while state represents internal data that can change over time.",
      },
      {
        id: "q2",
        question: "Which React hook is used to manage reactive state inside functional components?",
        options: ["useEffect", "useMemo", "useState", "useRef"],
        correctIndex: 2,
        explanation: "useState is the primary React hook for declaring state variables in functional components.",
      },
    ],
  },
  "fig-1": {
    quizId: "q-fig-1",
    lessonId: "fig-1",
    title: "UX Research Basics Quiz",
    passingPercentage: 70,
    questions: [
      {
        id: "q1",
        question: "What is the main goal of user research in product design?",
        options: [
          "Picking attractive color palettes",
          "Understanding user behaviors, needs, and pain points to make evidence-based design decisions",
          "Writing production frontend code",
          "Selling subscriptions immediately",
        ],
        correctIndex: 1,
        explanation: "User research focuses on understanding user expectations, pain points, and tasks to create intuitive and useful products.",
      },
      {
        id: "q2",
        question: "What is a 'User Persona' in UX design?",
        options: [
          "A real individual user's private personal information",
          "A fictional character created to represent a user type that might use a site or product in a similar way",
          "A vector logo",
          "An HTML template",
        ],
        correctIndex: 1,
        explanation: "A user persona is a semi-fictional archetype representing key traits, goals, and behaviors of your target audience.",
      },
    ],
  },
};

/**
 * Returns quiz for a lesson if configured, or generates a dynamic learning assessment for any course lesson.
 */
export function getLessonQuiz(lessonId: string, lessonTitle?: string): LessonQuiz {
  if (QUIZ_CATALOG[lessonId]) {
    return QUIZ_CATALOG[lessonId];
  }

  const title = lessonTitle || "Lesson Assessment";
  return {
    quizId: `dynamic-${lessonId}`,
    lessonId,
    title: `${title} Knowledge Check`,
    passingPercentage: 70,
    questions: [
      {
        id: `${lessonId}-q1`,
        question: `What is the core takeaway and best practice taught in "${title}"?`,
        options: [
          "Applying structured principles and verifying outcomes thoroughly",
          "Skipping unit testing to speed up deployment",
          "Hardcoding sensitive credentials in source code",
          "Avoiding documentation and code comments",
        ],
        correctIndex: 0,
        explanation: "Applying structured principles and systematically verifying concepts ensures maintainable, reliable learning outcomes.",
      },
      {
        id: `${lessonId}-q2`,
        question: `How does mastering "${title}" contribute to professional development?`,
        options: [
          "It provides reproducible skills and industry-standard workflows for real-world projects",
          "It eliminates the need for ongoing practice",
          "It only applies to small hobby projects",
          "It replaces all collaborative team workflows",
        ],
        correctIndex: 0,
        explanation: "Consistent mastery of fundamentals builds solid problem-solving capability for production environments.",
      },
      {
        id: `${lessonId}-q3`,
        question: "When applying these concepts, what is the best strategy when encountering an edge case?",
        options: [
          "Ignore the error and let it fail silently",
          "Investigate the root cause, validate assumptions, and implement a resilient solution",
          "Disable all error handling",
          "Delete the affected code block entirely",
        ],
        correctIndex: 1,
        explanation: "Thorough root cause analysis and resilient error handling are hallmarks of high quality engineering.",
      },
    ],
  };
}
