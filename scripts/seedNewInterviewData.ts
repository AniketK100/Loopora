import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db/connection";
import { Category } from "../src/lib/db/models/Category";
import { Question } from "../src/lib/db/models/Question";
import { User } from "../src/lib/db/models/User";
import { normalizeVideoUrl } from "../src/lib/embed/normalize";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const fallbackEnvPath = path.resolve(process.cwd(), ".env");

  let envFile = "";
  if (fs.existsSync(envPath)) {
    envFile = fs.readFileSync(envPath, "utf-8");
  } else if (fs.existsSync(fallbackEnvPath)) {
    envFile = fs.readFileSync(fallbackEnvPath, "utf-8");
  } else {
    console.warn("No env file found.");
    return;
  }

  envFile.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      process.env[key] = val;
    }
  });
}

loadEnv();

function generateAnswer(question: string) {
  const short = `A structured approach to answering the question: "${question}". Focus on self-awareness, professional growth, and aligning your response with the company's core values.`;
  const detailed = `
<p>Answering <strong>"${question}"</strong> effectively is a key part of your interview preparation.</p>
<p>Here are the core strategies to keep in mind:</p>
<ul>
  <li><strong>Be Honest & Reflective:</strong> Frame your answer around real experiences and professional self-awareness.</li>
  <li><strong>Keep it Constructive:</strong> Always focus on positive steps, learnings, or how you overcame challenges.</li>
  <li><strong>Align with the Role:</strong> Connect your response to the requirements and expectations of the target position.</li>
</ul>
<p>Ensure you structure your response clearly, keeping it to about 1-2 minutes in length.</p>
  `;
  const example = `
<strong>Situation:</strong> "When asked this question in an interview, I structure my response using a concrete professional scenario..."<br/>
<strong>Action:</strong> "I detail the exact steps I took, highlighting specific skills like communication, adaptability, or structured problem-solving..."<br/>
<strong>Result:</strong> "I conclude by sharing the positive outcome, what I learned, and how it makes me a stronger candidate for this role."
  `;
  return { short, detailed, example };
}

async function main() {
  await connectDB();
  
  // Find an admin user to set as creator/updater
  let adminUser = await User.findOne({ role: "admin" });
  if (!adminUser) {
    adminUser = await User.findOne({});
  }
  const adminId = adminUser ? adminUser._id : new mongoose.Types.ObjectId();
  
  // Get Category IDs
  const hrCat = await Category.findOne({ slug: "hr" });
  const behavioralCat = await Category.findOne({ slug: "behavioral" });
  
  if (!hrCat || !behavioralCat) {
    console.error("Missing standard categories 'hr' or 'behavioral'. Please seed the DB first.");
    process.exit(1);
  }
  
  const seedInfo = JSON.parse(fs.readFileSync("scratch/seed_matching_info.json", "utf-8"));
  console.log(`Loaded ${seedInfo.length} questions to seed/update...`);
  
  let createdCount = 0;
  let updatedCount = 0;
  
  for (const q of seedInfo) {
    const catId = q.category === "behavioral" ? behavioralCat._id : hrCat._id;
    
    // Normalize videos list
    const videos = [];
    let order = 0;
    for (const link of q.links) {
      try {
        const norm = normalizeVideoUrl(link);
        videos.push({
          label: `Explanation Video ${order + 1}`,
          url: norm.url,
          embedUrl: norm.embedUrl,
          provider: norm.provider,
          order: order++
        });
      } catch (err) {
        console.warn(`[Skip Video] Invalid URL: ${link} for question: ${q.dbQuestion}`);
      }
    }
    
    if (q.dbId) {
      // Update existing question
      const existingQ = await Question.findById(q.dbId);
      if (existingQ) {
        existingQ.videos = videos as any;
        existingQ.updatedBy = adminId as any;
        await existingQ.save();
        updatedCount++;
        console.log(`[Update] Added ${videos.length} videos to existing question: "${q.dbQuestion}"`);
      }
    } else {
      // Double check by slug to prevent duplicates on repeat runs
      const duplicateQ = await Question.findOne({ slug: q.dbSlug, category: catId });
      if (duplicateQ) {
        duplicateQ.videos = videos as any;
        await duplicateQ.save();
        updatedCount++;
        console.log(`[Update/Duplicate-Guard] Found match by slug. Updated question: "${q.dbQuestion}"`);
        continue;
      }
      
      // Create new question
      const newQ = new Question({
        category: catId,
        slug: q.dbSlug,
        question: q.dbQuestion,
        answer: generateAnswer(q.dbQuestion),
        videos,
        difficulty: "medium",
        frequencyRank: 5,
        tags: [q.category, "general", "interview-prep"],
        isPremium: false,
        isPublished: true,
        createdBy: adminId,
        updatedBy: adminId
      });
      await newQ.save();
      createdCount++;
      console.log(`[Create] Created new question: "${q.dbQuestion}" with ${videos.length} videos`);
    }
  }
  
  console.log(`\nSeeding completed successfully!`);
  console.log(`Created: ${createdCount}`);
  console.log(`Updated: ${updatedCount}`);
  
  process.exit(0);
}

main();
