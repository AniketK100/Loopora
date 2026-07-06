/**
 * Database Seed Script — InterviewLoop
 *
 * Populates the MongoDB Atlas database with a rich set of realistic sample data
 * (2 categories, 5 questions each, with 1-2 normalized video embeds each).
 *
 * Runs via: `npm run seed`
 *
 * @module scripts/seed
 * @see 06_Implementation_Plan_Build_Order.md Phase 2 — Seed Script
 */

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db/connection";
import { Category } from "../src/lib/db/models/Category";
import { Question } from "../src/lib/db/models/Question";
import { User } from "../src/lib/db/models/User";
import { normalizeVideoUrl } from "../src/lib/embed/normalize";

// --- Custom Env Loader (Safe for script execution outside Next.js lifecycle) ---
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const fallbackEnvPath = path.resolve(process.cwd(), ".env");

  let envFile = "";
  if (fs.existsSync(envPath)) {
    envFile = fs.readFileSync(envPath, "utf-8");
  } else if (fs.existsSync(fallbackEnvPath)) {
    envFile = fs.readFileSync(fallbackEnvPath, "utf-8");
  } else {
    console.warn("[Seed] Warning: No .env.local or .env file found.");
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

// Load env variables before connecting
loadEnv();

const SEED_USER_EMAIL = "seed.admin@loopora.com";

// --- Mock Categories ---------------------------------------------------------
const mockCategories = [
  {
    name: "HR / General",
    slug: "hr",
    description: "Behavioral, culture-fit, situational leadership, and standard icebreaker questions.",
    icon: "User",
    type: "hr" as const,
    order: 1,
    isPublished: true,
  },
  {
    name: "Technical — Core CS",
    slug: "technical-core",
    description: "Fundamentals of Databases (DBMS), Operating Systems (OS), Computer Networks (CN), and OOP.",
    icon: "Cpu",
    type: "technical" as const,
    order: 2,
    isPublished: true,
  },
];

// --- Mock Questions ----------------------------------------------------------
const getMockQuestions = (
  hrCatId: string,
  techCatId: string,
  adminId: string
) => [
  // --- HR CATEGORY QUESTIONS ---
  {
    category: new mongoose.Types.ObjectId(hrCatId),
    slug: "tell-me-about-yourself",
    question: "Tell me about yourself.",
    answer: {
      short: "A structured pitch following the Present-Past-Future framework to highlight your current status, key past achievements, and future alignment.",
      detailed: `
<p>This is the most common opener in interviews. A successful answer follows the <strong>Present-Past-Future</strong> formula:</p>
<ul>
  <li><strong>Present:</strong> Describe your current role, primary responsibilities, and recent key achievements.</li>
  <li><strong>Past:</strong> Highlight 1-2 past roles, internships, or academic projects that demonstrate transferable skills or domain expertise.</li>
  <li><strong>Future:</strong> Explain why you are looking for a transition and why this specific role and company align with your career roadmap.</li>
</ul>
<p>Keep your answer concise (90 to 120 seconds), avoid reciting your resume line-by-line, and frame your stories toward the value you can bring to the team.</p>
      `,
      example: `
<strong>Present:</strong> "I'm currently a Software Engineer at TechCorp, where I lead frontend development for our analytics dashboard. Recently, I led a migration that improved LCP by 40%."<br/>
<strong>Past:</strong> "Prior to this, I completed my degree in Computer Science, where I built an open-source workflow visualizer used by over 200 developers."<br/>
<strong>Future:</strong> "I've been following Loopora's work on developer productivity, and I'm excited about this role because it allows me to combine my passion for design systems with high-impact product engineering."
      `,
    },
    difficulty: "easy" as const,
    frequencyRank: 1,
    tags: ["behavioral", "introductory", "hr", "general"],
    isPremium: false,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [
      {
        label: "Explained by Priya Sharma",
        ...normalizeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        order: 0,
      },
      {
        label: "Alternative Loom Tutorial",
        ...normalizeVideoUrl("https://www.loom.com/share/d7c92f8d3d924d57a26f8d387f3b89ea"),
        order: 1,
      },
    ],
  },
  {
    category: new mongoose.Types.ObjectId(hrCatId),
    slug: "strengths-and-weaknesses",
    question: "What are your greatest strengths and weaknesses?",
    answer: {
      short: "Match a highly relevant professional strength with a concrete example. Offer a genuine weakness that you are actively taking steps to improve.",
      detailed: `
<p>This question gauges self-awareness and professional growth. Key advice:</p>
<p><strong>Greatest Strength:</strong> Select a skill or trait directly requested in the job description (e.g., proactive communication, structured problem solving). Ground your claim in a brief STAR story showing impact.</p>
<p><strong>Weakness:</strong> Pick a real professional weakness that is non-essential for the job. Show self-awareness by explaining how you recognized this weakness and detail the exact actions you are taking to overcome it (e.g., public speaking, delegation, specific skill gaps).</p>
      `,
      example: `
<strong>Strength:</strong> "My greatest strength is structured problem solving under tight deadlines. In my last project..."<br/>
<strong>Weakness:</strong> "My weakness is that I sometimes struggle with delegating tasks, fearing it will slow the project. To address this, I started using Trello to partition tasks and set clear milestones, which helped me successfully delegate 3 features in our last sprint."
      `,
    },
    difficulty: "medium" as const,
    frequencyRank: 2,
    tags: ["behavioral", "self-awareness", "hr"],
    isPremium: false,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [
      {
        label: "Explained by Rahul Verma",
        ...normalizeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        order: 0,
      },
    ],
  },
  {
    category: new mongoose.Types.ObjectId(hrCatId),
    slug: "why-do-you-want-to-join",
    question: "Why do you want to work at this company?",
    answer: {
      short: "Align your professional goals with the company's mission, culture, or recent achievements. Avoid generic praise; mention specific projects or values.",
      detailed: `
<p>To answer this question effectively, you must research the company ahead of time. Show that you understand:</p>
<ul>
  <li>Their core mission and culture values.</li>
  <li>Their actual business model and primary target audience.</li>
  <li>Recent engineering achievements, public updates, or product launches that genuine interest you.</li>
</ul>
<p>Avoid saying 'it's a great company' or 'great learning opportunity.' Focus instead on how their direction matches your skills and what you can contribute to their immediate roadmap.</p>
      `,
    },
    difficulty: "medium" as const,
    frequencyRank: 3,
    tags: ["culture-fit", "research", "hr"],
    isPremium: false,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [],
  },
  {
    category: new mongoose.Types.ObjectId(hrCatId),
    slug: "handling-conflict-star",
    question: "Describe a time you handled conflict in a team.",
    answer: {
      short: "A classic behavioral question best answered using the STAR framework to highlight collaboration, empathy, and positive business results.",
      detailed: `
<p>Use the <strong>STAR method</strong> (Situation, Task, Action, Result) to partition your answer:</p>
<ul>
  <li><strong>Situation:</strong> Outline the context of the conflict clearly and objectively. Avoid bad-mouthing team members.</li>
  <li><strong>Task:</strong> Explain your specific role and responsibility in resolving or working through the conflict.</li>
  <li><strong>Action:</strong> Walk through the concrete steps you took. Highlight active listening, finding common ground, and focusing on project goals.</li>
  <li><strong>Result:</strong> Share the positive resolution, key lessons learned, and the impact on project delivery.</li>
</ul>
      `,
    },
    difficulty: "hard" as const,
    frequencyRank: 4,
    tags: ["star-format", "behavioral", "conflict-resolution", "teamwork"],
    isPremium: true,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [
      {
        label: "STAR Framework Strategy Guide",
        ...normalizeVideoUrl("https://vimeo.com/76979871"),
        order: 0,
      },
    ],
  },
  {
    category: new mongoose.Types.ObjectId(hrCatId),
    slug: "five-year-plan",
    question: "Where do you see yourself in five years?",
    answer: {
      short: "Show ambition coupled with realistic growth goals that align with the trajectory of the role you are applying for.",
      detailed: `
<p>Interviewers want to see if you have realistic expectations and if this position matches your long-term career interests. To answer:</p>
<ul>
  <li>Highlight your desire to master the core domain of this specific role first.</li>
  <li>Express interest in growing into higher responsibility, leadership, or deep technical specialization within the same domain.</li>
  <li>Signal stability — show that you see this company as a place to build a multi-year career.</li>
</ul>
      `,
    },
    difficulty: "easy" as const,
    frequencyRank: 5,
    tags: ["career-goals", "stability", "hr"],
    isPremium: false,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [],
  },

  // --- TECHNICAL CATEGORY QUESTIONS ---
  {
    category: new mongoose.Types.ObjectId(techCatId),
    slug: "sql-vs-nosql",
    question: "Explain the difference between SQL and NoSQL databases.",
    answer: {
      short: "Compare relational (structured, SQL) vs. non-relational (unstructured/flexible, NoSQL) database systems across schema, scalability, and ACID compliance.",
      detailed: `
<p>The choice between SQL and NoSQL depends heavily on schema requirements, scaling models, and transactional properties:</p>
<table class="min-w-full border-collapse border border-[var(--color-border-light)] text-sm mb-4">
  <thead>
    <tr class="bg-[var(--color-bg-alt)] border-b border-[var(--color-border)]">
      <th class="p-2 border border-[var(--color-border-light)] text-left font-bold">Feature</th>
      <th class="p-2 border border-[var(--color-border-light)] text-left font-bold">SQL (Relational)</th>
      <th class="p-2 border border-[var(--color-border-light)] text-left font-bold">NoSQL (Non-Relational)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border border-[var(--color-border-light)] font-bold">Schema</td>
      <td class="p-2 border border-[var(--color-border-light)]">Strict, predefined, structured tables.</td>
      <td class="p-2 border border-[var(--color-border-light)]">Flexible, dynamic, document/key-value/graph.</td>
    </tr>
    <tr>
      <td class="p-2 border border-[var(--color-border-light)] font-bold">Scaling</td>
      <td class="p-2 border border-[var(--color-border-light)]">Vertical (scale up hardware). Can scale horizontally with complex setups.</td>
      <td class="p-2 border border-[var(--color-border-light)]">Horizontal (scale out across machines via sharding).</td>
    </tr>
    <tr>
      <td class="p-2 border border-[var(--color-border-light)] font-bold">ACID</td>
      <td class="p-2 border border-[var(--color-border-light)]">Strong ACID compliance by default.</td>
      <td class="p-2 border border-[var(--color-border-light)]">Follows CAP theorem; BASE model (Eventual Consistency).</td>
    </tr>
  </tbody>
</table>
<p>Use SQL when you have highly relational data and transactional integrity is critical (e.g., banking system). Use NoSQL when you need to store large volumes of unstructured or semi-structured data with rapid growth and high throughput requirements (e.g., user feeds, real-time analytics).</p>
      `,
    },
    difficulty: "medium" as const,
    frequencyRank: 1,
    tags: ["databases", "dbms", "sql", "nosql", "system-design"],
    isPremium: false,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [
      {
        label: "SQL vs NoSQL Architecture Comparison",
        ...normalizeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        order: 0,
      },
    ],
  },
  {
    category: new mongoose.Types.ObjectId(techCatId),
    slug: "explain-indexing",
    question: "How do database indexes work, and what are their trade-offs?",
    answer: {
      short: "Indexes speed up read queries by creating lookup data structures (typically B-Trees), at the expense of slower writes and extra storage.",
      detailed: `
<p>A database index is a data structure (typically a <strong>B-Tree</strong> or <strong>B+ Tree</strong> in relational databases) that allows the database engine to find rows without performing a full table scan.</p>
<p><strong>Benefits:</strong> Dramatic speedups for <code>SELECT</code> queries with <code>WHERE</code>, <code>JOIN</code>, or <code>ORDER BY</code> clauses.</p>
<p><strong>Trade-offs & Constraints:</strong></p>
<ul>
  <li><strong>Write Overhead:</strong> Every <code>INSERT</code>, <code>UPDATE</code>, and <code>DELETE</code> operation must also update the index, introducing write latency.</li>
  <li><strong>Storage Cost:</strong> Indexes consume disk space. Over-indexing can exhaust database memory.</li>
  <li><strong>Selectivity:</strong> Indicies work best on highly selective fields (e.g., UUID, email) rather than low-selectivity fields (e.g., gender, boolean flags).</li>
</ul>
      `,
    },
    difficulty: "medium" as const,
    frequencyRank: 2,
    tags: ["databases", "dbms", "indexing", "performance"],
    isPremium: false,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [
      {
        label: "Database Indexing Deep Dive",
        ...normalizeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        order: 0,
      },
    ],
  },
  {
    category: new mongoose.Types.ObjectId(techCatId),
    slug: "what-is-rest-api",
    question: "Explain the constraints of a RESTful API architecture.",
    answer: {
      short: "Identify the 6 architectural constraints of REST: Client-Server, Stateless, Cacheable, Uniform Interface, Layered System, and Code on Demand.",
      detailed: `
<p>REST (Representational State Transfer) is an architectural style, not a protocol. It relies on 6 key constraints:</p>
<ol>
  <li><strong>Client-Server Separation:</strong> Separation of UI concerns from data storage concerns allows independent development of frontend and backend.</li>
  <li><strong>Statelessness:</strong> Each request from a client must contain all necessary information to understand and process it. No session state is stored on the server.</li>
  <li><strong>Cacheability:</strong> Server responses must explicitly define if they are cacheable to prevent duplicate client-server requests.</li>
  <li><strong>Uniform Interface:</strong> Simplifies architecture by using standard methods (GET, POST, PUT, DELETE) and resource representation (URIs).</li>
  <li><strong>Layered System:</strong> A client cannot tell if it is connected directly to the end server or an intermediate proxy/load balancer.</li>
  <li><strong>Code on Demand (Optional):</strong> Servers can temporarily extend client functionality by transferring executable code (e.g., JavaScript applets).</li>
</ol>
      `,
    },
    difficulty: "easy" as const,
    frequencyRank: 3,
    tags: ["networks", "http", "api", "rest"],
    isPremium: false,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [],
  },
  {
    category: new mongoose.Types.ObjectId(techCatId),
    slug: "tcp-vs-udp",
    question: "Compare TCP and UDP protocols and their use cases.",
    answer: {
      short: "Compare connection-oriented, reliable transmission (TCP) vs. connectionless, fast, unreliable transmission (UDP) protocols.",
      detailed: `
<p>TCP and UDP are the main transport layer protocols in the Internet protocol suite:</p>
<table class="min-w-full border-collapse border border-[var(--color-border-light)] text-sm mb-4">
  <thead>
    <tr class="bg-[var(--color-bg-alt)] border-b border-[var(--color-border)]">
      <th class="p-2 border border-[var(--color-border-light)] text-left font-bold">Feature</th>
      <th class="p-2 border border-[var(--color-border-light)] text-left font-bold">TCP</th>
      <th class="p-2 border border-[var(--color-border-light)] text-left font-bold">UDP</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-2 border border-[var(--color-border-light)] font-bold">Connection</td>
      <td class="p-2 border border-[var(--color-border-light)]">Connection-oriented (3-way handshake).</td>
      <td class="p-2 border border-[var(--color-border-light)]">Connectionless (fire-and-forget).</td>
    </tr>
    <tr>
      <td class="p-2 border border-[var(--color-border-light)] font-bold">Reliability</td>
      <td class="p-2 border border-[var(--color-border-light)]">Guarantees delivery via packet acknowledgment and retransmission.</td>
      <td class="p-2 border border-[var(--color-border-light)]">No delivery guarantee. Packets can be lost, corrupted, or out of order.</td>
    </tr>
    <tr>
      <td class="p-2 border border-[var(--color-border-light)] font-bold">Speed</td>
      <td class="p-2 border border-[var(--color-border-light)]">Slower due to handshake, ordering checks, congestion control.</td>
      <td class="p-2 border border-[var(--color-border-light)]">Much faster. Minimal header size (8 bytes vs 20 bytes).</td>
    </tr>
  </tbody>
</table>
<p><strong>Use Cases:</strong> Use TCP for file transfers, emails, web pages (HTTP) where data completeness is critical. Use UDP for video streaming, gaming, VoIP where latency is more critical than minor packet loss.</p>
      `,
    },
    difficulty: "medium" as const,
    frequencyRank: 4,
    tags: ["networks", "protocols", "tcp", "udp"],
    isPremium: true,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [
      {
        label: "TCP Handshake Visual Guide",
        ...normalizeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
        order: 0,
      },
    ],
  },
  {
    category: new mongoose.Types.ObjectId(techCatId),
    slug: "what-is-thread",
    question: "What is the difference between a Process and a Thread?",
    answer: {
      short: "A process is an independent execution unit with its own memory space, while a thread is a lightweight execution path within a process sharing its memory.",
      detailed: `
<p>Processes and threads represent execution paths in an Operating System:</p>
<ul>
  <li><strong>Process:</strong> An execution of a program. It is completely isolated and has its own virtual memory space, file handles, and system resources. Context switching between processes is resource-intensive.</li>
  <li><strong>Thread:</strong> The smallest unit of execution within a process. Threads share the parent process's memory space (code, data, heap) but have their own stack and program counter. Sharing memory makes thread context-switching fast but introduces race conditions.</li>
</ul>
<p>Processes do not interfere with each other (crash isolation), whereas a faulty thread can crash all other threads within that process.</p>
      `,
    },
    difficulty: "hard" as const,
    frequencyRank: 5,
    tags: ["os", "threads", "processes", "concurrency"],
    isPremium: true,
    isPublished: true,
    createdBy: new mongoose.Types.ObjectId(adminId),
    videos: [],
  },
];

// --- Main Seeding Script Logic ------------------------------------------------
async function main() {
  console.log("[Seed] Starting database seed process...");

  try {
    // 1. Establish database connection
    await connectDB();

    // 2. Clean existing records to prevent duplicates in local development
    console.log("[Seed] Clearing collections...");
    await Category.deleteMany({});
    await Question.deleteMany({});
    await User.deleteMany({});

    // 3. Create a default admin/creator user for references
    console.log("[Seed] Creating default seed admin...");
    const dummyUser = await User.create({
      name: "Loopora Admin",
      email: SEED_USER_EMAIL,
      role: "admin",
      authProvider: "credentials",
      isPremium: true,
    });
    console.log(`[Seed] Admin created: ${dummyUser.email} (${dummyUser._id})`);

    // 4. Create categories
    console.log("[Seed] Inserting categories...");
    const categories = await Category.insertMany(mockCategories);
    console.log(`[Seed] Seeded ${categories.length} categories.`);

    const hrCat = categories.find((c) => c.slug === "hr")!;
    const techCat = categories.find((c) => c.slug === "technical-core")!;

    // 5. Create questions linked to categories
    console.log("[Seed] Inserting questions...");
    const mockQuestions = getMockQuestions(
      hrCat._id.toString(),
      techCat._id.toString(),
      dummyUser._id.toString()
    );

    const questions = await Question.insertMany(mockQuestions);
    console.log(`[Seed] Seeded ${questions.length} questions.`);

    // 6. Manually trigger denormalized counts to be sure hooks fired
    console.log("[Seed] Re-calculating denormalized question counts...");
    const hrCount = await Question.countDocuments({
      category: hrCat._id,
      isPublished: true,
    });
    const techCount = await Question.countDocuments({
      category: techCat._id,
      isPublished: true,
    });

    await Category.findByIdAndUpdate(hrCat._id, { questionCount: hrCount });
    await Category.findByIdAndUpdate(techCat._id, { questionCount: techCount });

    console.log(
      `[Seed] Category counts updated: HR = ${hrCount}, Technical = ${techCount}`
    );

    console.log("[Seed] Database seed completed successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error during seeding:", error);
    process.exit(1);
  }
}

// Execute seed script
main();
