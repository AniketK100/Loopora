/**
 * Shared Interview Workspace data loader — Server Module
 *
 * Fetches the category, the published question list (for the navigator), and the
 * active question's full content (for SSR/SEO) in a single round-trip. Shared by
 * the category page and the question-detail page so both render the same
 * three-column workspace from one source of truth.
 *
 * @module app/(public)/interview/workspace-data
 */

import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { User } from "@/lib/db/models/User";
import { auth } from "@/auth";
import { getEmbedUrl } from "@/lib/video/getEmbedUrl";
import type { Difficulty, VideoProvider } from "@/types";

export interface WorkspaceVideo {
  label: string;
  url: string;
  provider: VideoProvider;
  order: number;
  embedUrl?: string;
  resolvedSrc: string;
  resolvedType: "iframe" | "video" | "unsupported";
  aspectRatio?: string;
}

export interface WorkspaceQuestionNav {
  _id: string;
  slug: string;
  question: string;
  difficulty: Difficulty;
  isPremium: boolean;
  tags: string[];
  frequencyRank: number;
  videoCount: number;
  hasVideo: boolean;
  isFavorited: boolean;
  isPracticed: boolean;
}

export interface WorkspaceActiveQuestion {
  _id: string;
  slug: string;
  question: string;
  difficulty: Difficulty;
  isPremium: boolean;
  tags: string[];
  frequencyRank: number;
  shortSummary: string;
  detailedExplanation: string;
  example: string;
  videos: WorkspaceVideo[];
  resources: { title: string; url: string }[];
  isFavorited: boolean;
  isPracticed: boolean;
  category: { _id: string; slug: string; name: string };
}

export interface WorkspaceCategory {
  name: string;
  slug: string;
  description: string;
  icon: string;
  type: string;
  questionCount: number;
}

export interface WorkspaceData {
  category: WorkspaceCategory | null;
  questions: WorkspaceQuestionNav[];
  activeQuestion: WorkspaceActiveQuestion | null;
  userHasPremium: boolean;
}

function getIconEmoji(iconName?: string): string {
  switch (iconName?.toLowerCase()) {
    case "user":
      return "👤";
    case "code":
      return "💻";
    case "cpu":
      return "⚙️";
    case "briefcase":
      return "💼";
    case "award":
      return "🏆";
    case "brain":
      return "🧠";
    case "bookopen":
      return "📖";
    default:
      return "📁";
  }
}

export function categoryIcon(category: WorkspaceCategory | null): string {
  return getIconEmoji(category?.icon);
}

export async function getWorkspaceData(
  categorySlug: string,
  activeQuestionSlug?: string | null
): Promise<WorkspaceData> {
  await connectDB();
  const catSlug = categorySlug.toLowerCase();
  const categoryDoc = await Category.findOne({ slug: catSlug });

  if (!categoryDoc) {
    return { category: null, questions: [], activeQuestion: null, userHasPremium: false };
  }

  const session = await auth();
  const user = session?.user;
  const userHasPremium = user
    ? user.role === "admin" || user.role === "editor" || !!user.isPremium
    : false;

  // Project only navigator fields for the list (avoids serializing large answer
  // HTML for every question). The active question is fetched separately, in full.
  const [questionDocs, userDoc] = await Promise.all([
    Question.find({ category: categoryDoc._id, isPublished: true })
      .sort({ frequencyRank: 1 })
      .select("slug question difficulty isPremium tags frequencyRank videos"),
    user ? User.findById(user.id).select("bookmarks practiced") : Promise.resolve(null),
  ]);

  const bookmarkSet = new Set((userDoc?.bookmarks || []).map((b) => b.toString()));
  const practicedSet = new Set((userDoc?.practiced || []).map((p) => p.toString()));

  const questions: WorkspaceQuestionNav[] = questionDocs.map((q) => {
    const id = q._id.toString();
    const videos = q.videos || [];
    return {
      _id: id,
      slug: q.slug,
      question: q.question,
      difficulty: q.difficulty,
      isPremium: q.isPremium,
      tags: q.tags || [],
      frequencyRank: q.frequencyRank,
      videoCount: videos.length,
      hasVideo: videos.length > 0,
      isFavorited: bookmarkSet.has(id),
      isPracticed: practicedSet.has(id),
    };
  });

  const activeQuery = activeQuestionSlug
    ? { slug: activeQuestionSlug.toLowerCase(), category: categoryDoc._id }
    : { category: categoryDoc._id, isPublished: true };
  const activeDoc = await Question.findOne(activeQuery)
    .populate("category", "slug name")
    .sort({ frequencyRank: 1 });

  let activeQuestion: WorkspaceActiveQuestion | null = null;
  if (activeDoc) {
    const id = activeDoc._id.toString();
    const videos: WorkspaceVideo[] = (activeDoc.videos || []).map((v) => {
      const resolved = getEmbedUrl(v.url, (v as { embedUrl?: string }).embedUrl);
      return {
        label: v.label,
        url: v.url,
        provider: (v.provider || "youtube") as VideoProvider,
        order: v.order || 0,
        embedUrl: (v as { embedUrl?: string }).embedUrl,
        resolvedSrc: resolved.src,
        resolvedType: resolved.type,
        aspectRatio: resolved.aspectRatio,
      };
    });

    activeQuestion = {
      _id: id,
      slug: activeDoc.slug,
      question: activeDoc.question,
      difficulty: activeDoc.difficulty,
      isPremium: activeDoc.isPremium,
      tags: activeDoc.tags || [],
      frequencyRank: activeDoc.frequencyRank,
      shortSummary: activeDoc.answer?.short || "",
      detailedExplanation: activeDoc.answer?.detailed || "",
      example: activeDoc.answer?.example || "",
      videos,
      resources: (activeDoc.resources || []).map((r) => ({ title: r.title, url: r.url })),
      isFavorited: bookmarkSet.has(id),
      isPracticed: practicedSet.has(id),
      category: {
        _id: categoryDoc._id.toString(),
        slug: categoryDoc.slug,
        name: categoryDoc.name,
      },
    };
  }

  return {
    category: {
      name: categoryDoc.name,
      slug: categoryDoc.slug,
      description: categoryDoc.description || "",
      icon: categoryDoc.icon || "",
      type: categoryDoc.type,
      questionCount: questions.length,
    },
    questions,
    activeQuestion,
    userHasPremium,
  };
}
