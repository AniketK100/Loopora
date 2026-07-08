import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { connectDB } from "@/lib/db/connection";
import { auth } from "@/auth";
import { PremiumLandingPage } from "./PremiumLandingPage";

export const metadata = {
  title: "Loopora - Crack the Interview",
  description:
    "A cinematic interview preparation platform with curated questions, model answers, video walkthroughs, and feedback loops.",
  alternates: {
    canonical: "/",
  },
};

const fallbackCounts = {
  totalQuestions: 500,
  totalCategories: 12,
};

async function loadLandingCounts() {
  await connectDB();

  const [totalQuestions, totalCategories] = await Promise.all([
    Question.countDocuments({ isPublished: true }),
    Category.countDocuments({ isPublished: true }),
  ]);

  return {
    totalQuestions,
    totalCategories,
  };
}

async function getLandingCounts() {
  try {
    return await Promise.race([
      loadLandingCounts(),
      new Promise<typeof fallbackCounts>((resolve) => {
        setTimeout(() => resolve(fallbackCounts), 1500);
      }),
    ]);
  } catch {
    return fallbackCounts;
  }
}

export default async function PublicHomePage() {
  const [counts, session] = await Promise.all([
    getLandingCounts(),
    auth()
  ]);

  return <PremiumLandingPage {...counts} session={session} />;
}