import { MetadataRoute } from "next";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";

export const revalidate = 3600; // Cache sitemap for up to 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDB();

    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    // 1. Static Pages
    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 1.0,
      },
      {
        url: `${baseUrl}/interview`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/suggest`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/privacy`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/terms`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cookies`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      },
    ];

    // 2. Fetch all published categories
    const categories = await Category.find({ isPublished: true });
    
    // Map category ID string to its slug
    const categoryMap: Record<string, string> = {};
    const categoryUrls = categories.map((cat) => {
      categoryMap[cat._id.toString()] = cat.slug;
      return {
        url: `${baseUrl}/interview/${cat.slug}`,
        lastModified: cat.updatedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });

    // 3. Fetch all published questions
    const questions = await Question.find({ isPublished: true });
    const questionUrls = questions
      .map((q) => {
        const catId = q.category?.toString();
        const catSlug = catId ? categoryMap[catId] : null;
        if (!catSlug) return null;

        return {
          url: `${baseUrl}/interview/${catSlug}/${q.slug}`,
          lastModified: q.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        };
      })
      .filter((urlObj): urlObj is Exclude<typeof urlObj, null> => urlObj !== null);

    return [...staticUrls, ...categoryUrls, ...questionUrls];
  } catch (error) {
    console.error("[Sitemap Generation Error]:", error);
    // Return base static pages as fallback
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    return [
      { url: baseUrl, lastModified: new Date() },
      { url: `${baseUrl}/interview`, lastModified: new Date() },
      { url: `${baseUrl}/search`, lastModified: new Date() },
      { url: `${baseUrl}/suggest`, lastModified: new Date() },
      { url: `${baseUrl}/privacy`, lastModified: new Date() },
      { url: `${baseUrl}/terms`, lastModified: new Date() },
      { url: `${baseUrl}/cookies`, lastModified: new Date() },
    ];
  }
}
