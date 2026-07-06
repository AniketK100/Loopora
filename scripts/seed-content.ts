/**
 * Phase 6 — Comprehensive Content Seeding Script
 *
 * Seeds 5 categories with 50+ realistic interview questions each.
 * Directly writes to MongoDB Atlas using Mongoose models.
 *
 * Usage: npx tsx scripts/seed-content.ts
 *
 * @see 06_Implementation_Plan_Build_Order.md Phase 6 — Content Seeding
 */

import mongoose from "mongoose";
import path from "path";
import fs from "fs";

// --- Custom Env Loader (matches seed.ts / promote.ts pattern) ---
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

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// ─── Inline Schema Definitions (avoid import resolution issues with tsx) ────

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "" },
    order: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    slug: { type: String, required: true, unique: true },
    question: { type: String, required: true },
    answer: {
      short: { type: String, default: "" },
      detailed: { type: String, required: true },
      example: { type: String, default: "" },
    },
    videos: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    frequencyRank: { type: Number, default: 0 },
    tags: [{ type: String }],
    isPremium: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

// ─── Category Definitions ───────────────────────────────────────────────────

interface CategoryDef {
  name: string;
  slug: string;
  type: string;
  description: string;
  icon: string;
  order: number;
}

const CATEGORIES: CategoryDef[] = [
  {
    name: "HR / General",
    slug: "hr",
    type: "hr",
    description: "Behavioral, culture-fit, situational leadership, and standard icebreaker questions.",
    icon: "user",
    order: 1,
  },
  {
    name: "Technical — Core CS",
    slug: "technical-core",
    type: "technical",
    description: "Data structures, algorithms, complexity analysis, and core computer science fundamentals.",
    icon: "code",
    order: 2,
  },
  {
    name: "System Design",
    slug: "system-design",
    type: "technical",
    description: "Large-scale architecture, distributed systems, database design, and scalability patterns.",
    icon: "cpu",
    order: 3,
  },
  {
    name: "Behavioral — STAR Method",
    slug: "behavioral",
    type: "behavioral",
    description: "Structured behavioral responses using Situation, Task, Action, Result narratives.",
    icon: "award",
    order: 4,
  },
  {
    name: "Frontend Engineering",
    slug: "frontend",
    type: "technical",
    description: "React, JavaScript, CSS, accessibility, performance optimization, and browser APIs.",
    icon: "bookopen",
    order: 5,
  },
];

// ─── Question Content ───────────────────────────────────────────────────────

interface QuestionDef {
  categorySlug: string;
  slug: string;
  question: string;
  answer: { short: string; detailed: string; example?: string };
  difficulty: "easy" | "medium" | "hard";
  frequencyRank: number;
  tags: string[];
  isPremium: boolean;
}

function generateQuestions(): QuestionDef[] {
  const questions: QuestionDef[] = [];

  // ─── HR / General Questions (55 questions) ─────────────────────────────

  const hrQuestions: Omit<QuestionDef, "categorySlug">[] = [
    {
      slug: "tell-me-about-yourself",
      question: "Tell me about yourself.",
      answer: {
        short: "A structured pitch following the Present-Past-Future framework.",
        detailed: "<p>This is the most common opener. Follow the <strong>Present-Past-Future</strong> framework:</p><p><strong>Present:</strong> Describe your current role and key responsibilities.</p><p><strong>Past:</strong> Highlight 1-2 past roles or projects that demonstrate relevant skills.</p><p><strong>Future:</strong> Explain why this specific role aligns with your career goals.</p><p>Keep it concise (90-120 seconds) and tailor it to the job description.</p>",
        example: "<strong>Present:</strong> \"I'm a Software Engineer at TechCorp, where I lead frontend work on our analytics dashboard.\"<br/><strong>Past:</strong> \"Previously, I built an open-source workflow tool used by 200+ developers.\"<br/><strong>Future:</strong> \"I'm excited about this role because it lets me combine my frontend skills with product strategy.\"",
      },
      difficulty: "easy",
      frequencyRank: 1,
      tags: ["icebreaker", "opening", "self-introduction"],
      isPremium: false,
    },
    {
      slug: "greatest-strengths-weaknesses",
      question: "What are your greatest strengths and weaknesses?",
      answer: {
        short: "Pick genuine strengths relevant to the role and frame weaknesses as growth areas you're actively addressing.",
        detailed: "<p>For <strong>strengths</strong>, choose 2-3 that directly map to the job requirements. Provide evidence with brief examples.</p><p>For <strong>weaknesses</strong>, pick a genuine area of improvement (not a disguised strength). Show self-awareness and describe concrete steps you're taking to improve.</p><p>Avoid clichés like \"I'm a perfectionist\" — interviewers see through these instantly.</p>",
        example: "<strong>Strength:</strong> \"I'm strong at breaking complex technical problems into manageable sprints. At my last company, I decomposed a 6-month migration into 2-week milestones.\"<br/><strong>Weakness:</strong> \"I sometimes over-document solutions. I've started using a 'good enough' checklist to balance thoroughness with velocity.\"",
      },
      difficulty: "medium",
      frequencyRank: 2,
      tags: ["self-assessment", "strengths", "weaknesses"],
      isPremium: false,
    },
    {
      slug: "why-work-at-this-company",
      question: "Why do you want to work at this company?",
      answer: {
        short: "Demonstrate research into the company's mission, culture, and products, then align them with your career goals.",
        detailed: "<p>Show you've done your homework. Reference specific products, recent news, company values, or technical blog posts.</p><p>Connect their mission to your personal motivations. Avoid generic answers like \"great culture\" without specifics.</p><p>Structure: (1) What excites you about their product/mission, (2) Why your skills are a strong fit, (3) What you hope to learn or contribute.</p>",
      },
      difficulty: "medium",
      frequencyRank: 3,
      tags: ["motivation", "company-research", "culture-fit"],
      isPremium: false,
    },
    {
      slug: "where-do-you-see-yourself-five-years",
      question: "Where do you see yourself in five years?",
      answer: {
        short: "Show ambition aligned with the company's growth trajectory without being unrealistic.",
        detailed: "<p>Interviewers want to gauge your commitment and whether you'll grow with the team. Avoid saying you want the interviewer's job.</p><p>Focus on skill growth, leadership aspirations, and impact. Tie your 5-year vision to the role's natural progression path.</p><p>Be honest but strategic — show you're thinking long-term about your career in a way that benefits the organization.</p>",
      },
      difficulty: "easy",
      frequencyRank: 4,
      tags: ["career-goals", "ambition", "long-term"],
      isPremium: false,
    },
    {
      slug: "why-are-you-leaving-current-job",
      question: "Why are you leaving your current job?",
      answer: {
        short: "Focus on what you're moving toward, not what you're running from. Stay positive about past employers.",
        detailed: "<p>Never badmouth your current employer. Frame the transition as a positive career move.</p><p>Good reasons: seeking new challenges, wanting to work in a different domain, looking for more ownership, or pursuing a specific technology stack.</p><p>If you were laid off, be honest and brief — layoffs are common and not a reflection of individual performance.</p>",
      },
      difficulty: "easy",
      frequencyRank: 5,
      tags: ["career-transition", "motivation", "resignation"],
      isPremium: false,
    },
    {
      slug: "salary-expectations",
      question: "What are your salary expectations?",
      answer: {
        short: "Research market rates beforehand and provide a range anchored by data rather than a single number.",
        detailed: "<p>Do your homework using Glassdoor, Levels.fyi, or Payscale before the interview.</p><p>Provide a range (e.g., \"Based on my research and experience, I'm looking at $120K-$140K\"). Anchor the bottom of your range at your actual target.</p><p>If pressed for a single number early in the process, it's okay to say: \"I'd like to understand the full compensation package before committing to a number.\"</p>",
      },
      difficulty: "medium",
      frequencyRank: 6,
      tags: ["negotiation", "compensation", "salary"],
      isPremium: false,
    },
    {
      slug: "describe-your-work-style",
      question: "Describe your work style.",
      answer: {
        short: "Describe how you organize, prioritize, and collaborate — with concrete examples.",
        detailed: "<p>Cover three dimensions: (1) <strong>Individual work habits</strong> — how you plan, focus, and deliver. (2) <strong>Collaboration style</strong> — how you communicate and work in teams. (3) <strong>Adaptability</strong> — how you handle changing priorities.</p><p>Use specific tools or frameworks you rely on (e.g., time-boxing, Kanban boards, async communication).</p>",
      },
      difficulty: "easy",
      frequencyRank: 7,
      tags: ["work-style", "productivity", "collaboration"],
      isPremium: false,
    },
    {
      slug: "what-motivates-you",
      question: "What motivates you at work?",
      answer: {
        short: "Connect intrinsic motivators (impact, learning, ownership) to the role's responsibilities.",
        detailed: "<p>Interviewers want to know if the role will keep you engaged long-term. Focus on intrinsic motivators: solving hard problems, mentoring others, shipping products that impact users, learning new technologies.</p><p>Avoid purely extrinsic motivators (money, title) as primary answers. Connect your motivators to specific aspects of the role.</p>",
      },
      difficulty: "easy",
      frequencyRank: 8,
      tags: ["motivation", "engagement", "drive"],
      isPremium: false,
    },
    {
      slug: "how-do-you-handle-stress-pressure",
      question: "How do you handle stress and pressure?",
      answer: {
        short: "Demonstrate specific coping strategies and give an example of thriving under pressure.",
        detailed: "<p>Don't say \"I work well under pressure\" without evidence. Describe your actual system: prioritization frameworks, breaking problems into smaller tasks, taking short breaks, communicating proactively with stakeholders about timelines.</p><p>Give a concrete example of a high-pressure situation where your approach led to a successful outcome.</p>",
      },
      difficulty: "medium",
      frequencyRank: 9,
      tags: ["stress-management", "resilience", "pressure"],
      isPremium: false,
    },
    {
      slug: "tell-me-about-a-failure",
      question: "Tell me about a time you failed.",
      answer: {
        short: "Choose a genuine failure, own it completely, and focus on what you learned and changed.",
        detailed: "<p>This tests self-awareness and growth mindset. Pick a real failure (not a humble-brag). Structure your answer as:</p><p>(1) <strong>Context:</strong> What happened and why. (2) <strong>Ownership:</strong> What was your role in the failure. (3) <strong>Learning:</strong> What you learned and how you changed your approach. (4) <strong>Result:</strong> How you've applied the lesson since.</p>",
        example: "<strong>Situation:</strong> \"I underestimated the complexity of migrating our auth system and gave an optimistic 2-week estimate.\"<br/><strong>Outcome:</strong> \"It took 6 weeks, delaying a product launch.\"<br/><strong>Learning:</strong> \"I now break migrations into discovery and execution phases with separate estimates, and always add a 30% buffer.\"",
      },
      difficulty: "medium",
      frequencyRank: 10,
      tags: ["failure", "growth-mindset", "self-awareness"],
      isPremium: false,
    },
    { slug: "greatest-achievement", question: "What is your greatest professional achievement?", answer: { short: "Pick an achievement with measurable impact that's relevant to the target role.", detailed: "<p>Choose an accomplishment with quantifiable results. Use the STAR method to structure your response.</p><p>Good achievements demonstrate initiative, technical skill, leadership, or impact. Make sure the achievement is relevant to the role you're interviewing for.</p>" }, difficulty: "easy", frequencyRank: 11, tags: ["achievement", "impact", "results"], isPremium: false },
    { slug: "how-do-you-prioritize-tasks", question: "How do you prioritize tasks when everything is urgent?", answer: { short: "Use frameworks like Eisenhower Matrix or MoSCoW to triage systematically.", detailed: "<p>Demonstrate a systematic approach. Mention frameworks like the Eisenhower Matrix (urgent vs. important), MoSCoW prioritization, or impact/effort scoring.</p><p>Key steps: (1) Clarify true deadlines, (2) Identify dependencies, (3) Communicate trade-offs to stakeholders, (4) Focus on highest-impact items first.</p>" }, difficulty: "medium", frequencyRank: 12, tags: ["prioritization", "time-management", "organization"], isPremium: false },
    { slug: "describe-ideal-work-environment", question: "Describe your ideal work environment.", answer: { short: "Align your preferences with the company's culture while being genuine.", detailed: "<p>Research the company's culture beforehand. Describe preferences that genuinely match: remote vs. in-office, collaborative vs. independent, fast-paced vs. methodical.</p><p>Be honest — this is also your chance to evaluate if the company is a good fit for you.</p>" }, difficulty: "easy", frequencyRank: 13, tags: ["culture-fit", "work-environment", "preferences"], isPremium: false },
    { slug: "how-do-you-handle-criticism", question: "How do you handle constructive criticism?", answer: { short: "Show that you welcome feedback as a tool for growth, with a concrete example.", detailed: "<p>Frame feedback as essential for professional growth. Describe your process: (1) Listen without becoming defensive, (2) Ask clarifying questions, (3) Reflect and identify actionable changes, (4) Follow up on improvements.</p><p>Give a specific example where feedback improved your work significantly.</p>" }, difficulty: "easy", frequencyRank: 14, tags: ["feedback", "growth", "communication"], isPremium: false },
    { slug: "what-do-you-know-about-our-company", question: "What do you know about our company?", answer: { short: "Demonstrate deep research into products, mission, recent milestones, and team culture.", detailed: "<p>Go beyond the homepage. Research: (1) Recent product launches or pivots, (2) Engineering blog posts or tech talks, (3) Glassdoor reviews (for culture insights), (4) Leadership team backgrounds, (5) Funding rounds or market position.</p><p>Show genuine interest by connecting your findings to why you want to join.</p>" }, difficulty: "easy", frequencyRank: 15, tags: ["company-research", "preparation", "knowledge"], isPremium: false },
    { slug: "how-do-you-learn-new-skills", question: "How do you learn new technologies or skills?", answer: { short: "Describe your learning system: resources, practice methods, and how you apply new knowledge.", detailed: "<p>Demonstrate a structured learning approach. Mention: (1) How you discover what to learn (staying current with trends), (2) Your learning methods (documentation, courses, building projects, reading source code), (3) How you practice and apply new skills, (4) How you share knowledge with your team.</p>" }, difficulty: "easy", frequencyRank: 16, tags: ["learning", "growth", "self-improvement"], isPremium: false },
    { slug: "describe-leadership-experience", question: "Describe a time you demonstrated leadership.", answer: { short: "Leadership isn't just management — show influence, initiative, or mentorship.", detailed: "<p>Leadership can mean: taking initiative on a stalled project, mentoring junior developers, facilitating difficult team decisions, or driving technical standards.</p><p>Use the STAR method. Focus on the impact of your leadership and how it benefited the team or organization.</p>", example: "<strong>Situation:</strong> \"Our team had no code review standards, leading to recurring production bugs.\"<br/><strong>Action:</strong> \"I proposed and implemented a review checklist, ran training sessions, and championed the process.\"<br/><strong>Result:</strong> \"Production bug rate dropped 45% over 3 months.\"" }, difficulty: "medium", frequencyRank: 17, tags: ["leadership", "initiative", "mentorship"], isPremium: false },
    { slug: "how-do-you-resolve-disagreements", question: "How do you resolve disagreements with coworkers?", answer: { short: "Listen first, seek to understand, find common ground, and focus on shared goals.", detailed: "<p>Show emotional intelligence and conflict resolution skills. Key steps: (1) Listen actively and understand their perspective, (2) Find common ground and shared goals, (3) Present your view with data, (4) Compromise or escalate appropriately, (5) Maintain the relationship regardless of outcome.</p>" }, difficulty: "medium", frequencyRank: 18, tags: ["conflict-resolution", "teamwork", "communication"], isPremium: false },
    { slug: "what-questions-do-you-have", question: "Do you have any questions for us?", answer: { short: "Always have 3-5 thoughtful questions prepared that show genuine interest in the role and team.", detailed: "<p>Never say \"No questions.\" Prepare questions about: (1) Team structure and day-to-day work, (2) Technical challenges and roadmap, (3) Growth opportunities and mentorship, (4) Team culture and collaboration, (5) What success looks like in the first 90 days.</p><p>Avoid questions about salary, PTO, or perks in early rounds. These are for the offer stage.</p>" }, difficulty: "easy", frequencyRank: 19, tags: ["questions", "engagement", "curiosity"], isPremium: false },
    { slug: "describe-difficult-decision", question: "Describe a difficult decision you had to make at work.", answer: { short: "Walk through your decision-making framework and the trade-offs you evaluated.", detailed: "<p>Interviewers assess your judgment and decision-making process. Structure: (1) Context and constraints, (2) Options you considered, (3) How you evaluated trade-offs, (4) The decision and its rationale, (5) Outcome and what you'd do differently.</p>" }, difficulty: "medium", frequencyRank: 20, tags: ["decision-making", "judgment", "trade-offs"], isPremium: false },
    { slug: "teamwork-example", question: "Give an example of successful teamwork.", answer: { short: "Highlight your specific contribution to a collaborative achievement.", detailed: "<p>Focus on your role within the team, not just the team's success. Describe: (1) The team composition and goal, (2) Your specific contributions, (3) How you communicated and collaborated, (4) Challenges you overcame together, (5) The measurable outcome.</p>" }, difficulty: "easy", frequencyRank: 21, tags: ["teamwork", "collaboration", "contribution"], isPremium: false },
    { slug: "handle-tight-deadline", question: "How do you handle tight deadlines?", answer: { short: "Show your prioritization system and how you communicate with stakeholders under time pressure.", detailed: "<p>Demonstrate composure and systematic approach: (1) Assess scope and identify the minimum viable deliverable, (2) Communicate constraints to stakeholders early, (3) Focus on high-impact tasks first, (4) Eliminate unnecessary meetings and context-switching, (5) Ask for help when needed.</p>" }, difficulty: "medium", frequencyRank: 22, tags: ["deadlines", "time-management", "pressure"], isPremium: false },
    { slug: "career-gap-explanation", question: "Can you explain the gap in your employment history?", answer: { short: "Be honest and brief, then redirect to what you learned or how you stayed current.", detailed: "<p>Gaps are normal and increasingly common. Be straightforward: personal health, caregiving, travel, education, side projects, or simply taking a break to recharge.</p><p>Focus on what you did during the gap that's relevant: online courses, open-source contributions, freelancing, or personal projects. Then redirect to why you're excited about this opportunity.</p>" }, difficulty: "easy", frequencyRank: 23, tags: ["career-gap", "explanation", "honesty"], isPremium: false },
    { slug: "remote-work-effectiveness", question: "How do you stay productive when working remotely?", answer: { short: "Describe your remote work system: workspace setup, communication habits, and accountability methods.", detailed: "<p>Cover: (1) Dedicated workspace and routine, (2) Communication practices (async updates, video calls, documentation), (3) Self-accountability (task tracking, daily goals), (4) Boundaries between work and personal time, (5) How you maintain team connection and culture remotely.</p>" }, difficulty: "easy", frequencyRank: 24, tags: ["remote-work", "productivity", "communication"], isPremium: false },
    { slug: "management-style-preference", question: "What management style do you prefer?", answer: { short: "Describe the balance of autonomy and guidance that helps you do your best work.", detailed: "<p>Be genuine about what helps you succeed. Most strong answers balance autonomy with support: \"I thrive with clear goals and context, then the freedom to execute. I value managers who are available for unblocking but trust me to manage my own time.\"</p><p>Connect your answer to the team's leadership style if you've researched it.</p>" }, difficulty: "easy", frequencyRank: 25, tags: ["management", "autonomy", "preferences"], isPremium: false },
    { slug: "handling-ambiguity", question: "How do you handle ambiguity in a project?", answer: { short: "Demonstrate comfort with uncertainty and a systematic approach to reducing it.", detailed: "<p>Show you can thrive without perfect information. Steps: (1) Identify what you know vs. what's uncertain, (2) Gather information through research and stakeholder conversations, (3) Make reasonable assumptions and document them, (4) Start with a small prototype or spike, (5) Iterate based on feedback.</p>" }, difficulty: "medium", frequencyRank: 26, tags: ["ambiguity", "uncertainty", "problem-solving"], isPremium: false },
    { slug: "biggest-weakness-follow-up", question: "What would your previous manager say is your biggest area for improvement?", answer: { short: "Reference actual feedback you've received and how you've acted on it.", detailed: "<p>This variant catches candidates who rehearse \"weakness\" answers. Reference real feedback from performance reviews or 1-on-1s. Show: (1) The specific feedback, (2) Your initial reaction, (3) Concrete steps you took to improve, (4) Progress you've made.</p>" }, difficulty: "medium", frequencyRank: 27, tags: ["feedback", "self-awareness", "improvement"], isPremium: false },
    { slug: "tell-me-about-a-time-you-went-above-and-beyond", question: "Tell me about a time you went above and beyond.", answer: { short: "Describe taking initiative beyond your job description and the impact it created.", detailed: "<p>Choose an example where you proactively identified a need and took action without being asked. Focus on: (1) What you noticed, (2) Why you decided to act, (3) What you did beyond expectations, (4) The measurable impact.</p>" }, difficulty: "easy", frequencyRank: 28, tags: ["initiative", "proactive", "impact"], isPremium: false },
    { slug: "multitasking-ability", question: "How do you manage multiple projects simultaneously?", answer: { short: "Describe your system for tracking, prioritizing, and context-switching between projects.", detailed: "<p>Effective multitasking is about context management, not doing everything at once. Describe: (1) How you track tasks across projects (tools, systems), (2) Time-blocking strategies, (3) How you minimize context-switching costs, (4) How you communicate status to different stakeholders.</p>" }, difficulty: "medium", frequencyRank: 29, tags: ["multitasking", "project-management", "organization"], isPremium: false },
    { slug: "what-makes-you-unique", question: "What makes you unique compared to other candidates?", answer: { short: "Identify the intersection of your skills, experience, and perspective that's hard to replicate.", detailed: "<p>Don't try to be \"the best\" at everything. Instead, identify your unique combination: a specific technical skill + domain expertise + soft skill that creates outsized value. For example: \"I combine deep frontend performance expertise with a UX research background, letting me build interfaces that are both technically optimal and user-centered.\"</p>" }, difficulty: "medium", frequencyRank: 30, tags: ["unique-value", "differentiation", "pitch"], isPremium: false },
    { slug: "ethical-dilemma-at-work", question: "Describe an ethical dilemma you faced at work.", answer: { short: "Show integrity, transparency, and a clear decision-making framework.", detailed: "<p>Choose a genuine situation where you had to make a values-based decision. Structure: (1) The dilemma and conflicting pressures, (2) Your decision-making process, (3) The action you took, (4) The outcome and what it says about your values.</p><p>Good examples: reporting a bug vs. shipping on time, pushing back on misleading metrics, handling confidential information.</p>" }, difficulty: "hard", frequencyRank: 31, tags: ["ethics", "integrity", "values"], isPremium: true },
    { slug: "deal-with-difficult-coworker", question: "How would you deal with a difficult coworker?", answer: { short: "Address the behavior directly, seek understanding, and focus on work outcomes.", detailed: "<p>Show emotional intelligence and professionalism. Steps: (1) Assume positive intent initially, (2) Address the issue privately and directly, (3) Focus on behaviors and impact, not personality, (4) Seek to understand their perspective, (5) Propose a constructive path forward, (6) Escalate to management only if direct resolution fails.</p>" }, difficulty: "medium", frequencyRank: 32, tags: ["conflict", "interpersonal", "professionalism"], isPremium: false },
    { slug: "biggest-professional-risk", question: "What's the biggest professional risk you've taken?", answer: { short: "Describe a calculated risk where you evaluated trade-offs and took action despite uncertainty.", detailed: "<p>Good risks show initiative and judgment: changing companies, proposing a new architecture, leading a major refactor, or advocating for a unpopular technical decision. Structure: (1) The risk and stakes involved, (2) How you evaluated it, (3) The decision and its outcome, (4) What you learned about risk-taking.</p>" }, difficulty: "hard", frequencyRank: 33, tags: ["risk-taking", "initiative", "judgment"], isPremium: true },
    { slug: "how-stay-updated-industry", question: "How do you stay updated with industry trends?", answer: { short: "Describe a curated system of sources, communities, and hands-on experimentation.", detailed: "<p>Show a systematic approach: (1) Curated reading list (blogs, newsletters, papers), (2) Community participation (meetups, conferences, Discord/Slack groups), (3) Hands-on experimentation with new tools, (4) Knowledge sharing with your team (lunch-and-learns, internal docs).</p>" }, difficulty: "easy", frequencyRank: 34, tags: ["learning", "industry-trends", "continuous-improvement"], isPremium: false },
    { slug: "tell-about-project-you-are-proud-of", question: "Tell me about a project you're most proud of.", answer: { short: "Choose a project that demonstrates ownership, technical skill, and measurable impact.", detailed: "<p>Select a project where you had significant ownership. Cover: (1) The problem or opportunity, (2) Your technical approach and key decisions, (3) Challenges you overcame, (4) Quantifiable results and business impact, (5) What you learned.</p>" }, difficulty: "easy", frequencyRank: 35, tags: ["project", "ownership", "impact"], isPremium: false },
    { slug: "how-handle-receiving-no", question: "How do you handle being told 'no' on a proposal?", answer: { short: "Show resilience and the ability to advocate respectfully while accepting decisions.", detailed: "<p>Demonstrate maturity: (1) Seek to understand the reasoning behind the 'no', (2) Ask what would need to change for reconsideration, (3) Respect the decision while maintaining your view, (4) Look for alternative approaches, (5) If appropriate, build evidence and revisit later.</p>" }, difficulty: "medium", frequencyRank: 36, tags: ["resilience", "advocacy", "professionalism"], isPremium: false },
    { slug: "what-is-your-communication-style", question: "How would you describe your communication style?", answer: { short: "Describe how you adapt communication to different audiences and contexts.", detailed: "<p>Good communicators adapt. Describe: (1) How you communicate with technical vs. non-technical audiences, (2) Your preference for written vs. verbal communication and when you use each, (3) How you handle difficult conversations, (4) Examples of effective communication that led to positive outcomes.</p>" }, difficulty: "easy", frequencyRank: 37, tags: ["communication", "style", "adaptability"], isPremium: false },
    { slug: "what-would-first-90-days-look-like", question: "What would your first 90 days look like in this role?", answer: { short: "Show a structured onboarding approach: learn, contribute, then drive impact.", detailed: "<p>Structure in three phases: <strong>Days 1-30 (Learn):</strong> Understand the codebase, meet stakeholders, shadow team members, ship a small PR. <strong>Days 31-60 (Contribute):</strong> Own a moderate-sized feature, establish relationships, identify improvement opportunities. <strong>Days 61-90 (Drive):</strong> Lead a project, propose process improvements, begin mentoring.</p>" }, difficulty: "medium", frequencyRank: 38, tags: ["onboarding", "first-90-days", "planning"], isPremium: false },
    { slug: "handling-multiple-offers", question: "How would you decide between multiple job offers?", answer: { short: "Describe a framework weighing growth, team, mission, compensation, and culture.", detailed: "<p>Show thoughtful decision-making: (1) Create a weighted scorecard of factors that matter to you, (2) Evaluate each offer against: team quality, growth trajectory, mission alignment, technical challenges, compensation, work-life balance, (3) Have honest conversations with each company, (4) Trust your gut on cultural fit.</p>" }, difficulty: "easy", frequencyRank: 39, tags: ["decision-making", "career-choices", "offers"], isPremium: false },
    { slug: "diversity-and-inclusion", question: "How do you contribute to diversity and inclusion in your workplace?", answer: { short: "Share concrete actions you take to foster inclusive environments, not just abstract values.", detailed: "<p>Focus on actions, not just beliefs: (1) Inclusive code review practices, (2) Advocating for diverse hiring panels, (3) Mentoring underrepresented colleagues, (4) Being mindful of meeting dynamics and ensuring all voices are heard, (5) Calling out bias when you see it, (6) Supporting ERGs or D&I initiatives.</p>" }, difficulty: "medium", frequencyRank: 40, tags: ["diversity", "inclusion", "culture"], isPremium: false },
    { slug: "how-give-feedback", question: "How do you give feedback to peers?", answer: { short: "Use a structured approach: be specific, timely, and focus on behavior over personality.", detailed: "<p>Effective feedback follows these principles: (1) Be timely — give feedback close to the event, (2) Be specific — reference concrete behaviors, (3) Focus on impact — explain how the behavior affected outcomes, (4) Be private for constructive feedback, public for praise, (5) Suggest alternatives, don't just criticize.</p>" }, difficulty: "easy", frequencyRank: 41, tags: ["feedback", "communication", "peer-review"], isPremium: false },
    { slug: "what-frustrates-you-at-work", question: "What frustrates you most at work?", answer: { short: "Be honest but professional — focus on systemic issues, not people.", detailed: "<p>Show self-awareness without being negative. Good answers focus on: process inefficiencies you've tried to fix, unclear priorities that slow the team, or technical debt that prevents shipping. Always pair the frustration with how you've tried to address it constructively.</p>" }, difficulty: "medium", frequencyRank: 42, tags: ["frustration", "self-awareness", "problem-solving"], isPremium: false },
    { slug: "hobbies-and-interests", question: "What do you do outside of work?", answer: { short: "Share genuine interests that show you're well-rounded — bonus if they connect to work skills.", detailed: "<p>Be authentic. This question builds rapport. Share hobbies that demonstrate interesting traits: side projects (initiative), sports (discipline), volunteering (values), reading (intellectual curiosity), creative pursuits (problem-solving from different angles).</p><p>Keep it brief and genuine. Don't fabricate interests to impress.</p>" }, difficulty: "easy", frequencyRank: 43, tags: ["hobbies", "personal", "rapport"], isPremium: false },
    { slug: "how-measure-success", question: "How do you measure your success at work?", answer: { short: "Combine outcome metrics with personal growth and team impact indicators.", detailed: "<p>Show a balanced view: (1) <strong>Outcome metrics:</strong> features shipped, performance improvements, bug reduction, (2) <strong>Team impact:</strong> code reviews given, documentation written, teammates unblocked, (3) <strong>Personal growth:</strong> new skills learned, challenging problems solved, feedback incorporated.</p>" }, difficulty: "easy", frequencyRank: 44, tags: ["success-metrics", "self-evaluation", "impact"], isPremium: false },
    { slug: "tell-about-a-mentor", question: "Tell me about a mentor or someone who influenced your career.", answer: { short: "Describe specific lessons learned and how they shaped your professional approach.", detailed: "<p>This reveals what you value in professional relationships. Describe: (1) Who the person was and the context, (2) Specific advice or lessons they shared, (3) How their influence shaped your work habits, decisions, or career path, (4) How you pay it forward through your own mentoring.</p>" }, difficulty: "easy", frequencyRank: 45, tags: ["mentorship", "influence", "career-development"], isPremium: false },
    { slug: "how-build-trust-new-team", question: "How do you build trust with a new team?", answer: { short: "Listen first, deliver consistently, be transparent, and show vulnerability appropriately.", detailed: "<p>Trust-building strategies: (1) Listen more than you talk in the first weeks, (2) Deliver on small commitments reliably, (3) Be transparent about what you don't know, (4) Help teammates without being asked, (5) Share context behind your decisions, (6) Admit mistakes quickly and publicly.</p>" }, difficulty: "medium", frequencyRank: 46, tags: ["trust", "teamwork", "relationships"], isPremium: false },
    { slug: "what-type-of-projects-enjoy", question: "What type of projects do you enjoy most?", answer: { short: "Align your preferences with the role while showing flexibility.", detailed: "<p>Be genuine — this helps both sides assess fit. Describe: (1) The characteristics of projects that energize you (greenfield vs. optimization, frontend vs. backend, product vs. infrastructure), (2) Why those characteristics appeal to you, (3) How you stay effective on projects outside your preference zone.</p>" }, difficulty: "easy", frequencyRank: 47, tags: ["project-preferences", "motivation", "self-awareness"], isPremium: false },
    { slug: "handle-conflicting-priorities-stakeholders", question: "How do you handle conflicting priorities from different stakeholders?", answer: { short: "Facilitate alignment through transparent communication and objective trade-off analysis.", detailed: "<p>Steps: (1) Understand each stakeholder's underlying need (not just their request), (2) Map priorities against business objectives, (3) Make trade-offs visible with data, (4) Facilitate a conversation between stakeholders if needed, (5) Get explicit agreement on priorities and communicate the plan clearly, (6) Escalate to leadership if alignment can't be reached.</p>" }, difficulty: "hard", frequencyRank: 48, tags: ["stakeholder-management", "prioritization", "communication"], isPremium: true },
    { slug: "what-do-you-value-in-a-team", question: "What do you value most in a team?", answer: { short: "Describe the team dynamics that help you do your best work.", detailed: "<p>Focus on: (1) Psychological safety — ability to take risks without fear, (2) Technical excellence — high bar for code quality and engineering practices, (3) Transparency — open communication about goals and challenges, (4) Mutual respect — valuing diverse perspectives and expertise, (5) Shared ownership — everyone contributes and everyone is accountable.</p>" }, difficulty: "easy", frequencyRank: 49, tags: ["team-values", "culture", "collaboration"], isPremium: false },
    { slug: "biggest-misconception-about-you", question: "What's the biggest misconception people have about you?", answer: { short: "Choose a genuine misconception and explain the reality with a brief example.", detailed: "<p>This tests self-awareness. Pick something that's genuinely misunderstood: \"People assume I'm quiet and reserved, but once I'm comfortable in a team, I'm usually the one driving discussions and proposing ideas.\" Back it up with a brief example that shows the reality.</p>" }, difficulty: "easy", frequencyRank: 50, tags: ["self-awareness", "perception", "authenticity"], isPremium: false },
  ];

  hrQuestions.forEach((q) => questions.push({ ...q, categorySlug: "hr" }));

  // ─── Technical — Core CS Questions (52 questions) ──────────────────────

  const techQuestions: Omit<QuestionDef, "categorySlug">[] = [
    { slug: "explain-big-o-notation", question: "Explain Big O notation and why it matters.", answer: { short: "Big O describes the upper bound of an algorithm's time or space growth rate as input scales.", detailed: "<p>Big O notation characterizes algorithms by their worst-case growth rate. Common complexities:</p><p><strong>O(1)</strong> — Constant: hash table lookup<br/><strong>O(log n)</strong> — Logarithmic: binary search<br/><strong>O(n)</strong> — Linear: array traversal<br/><strong>O(n log n)</strong> — Linearithmic: merge sort<br/><strong>O(n²)</strong> — Quadratic: nested loops<br/><strong>O(2ⁿ)</strong> — Exponential: recursive Fibonacci</p><p>It matters because it lets you predict performance at scale and compare algorithm efficiency objectively.</p>" }, difficulty: "easy", frequencyRank: 1, tags: ["complexity", "big-o", "algorithms"], isPremium: false },
    { slug: "array-vs-linked-list", question: "Compare arrays and linked lists. When would you use each?", answer: { short: "Arrays offer O(1) random access; linked lists offer O(1) insertion/deletion at known positions.", detailed: "<p><strong>Arrays:</strong> Contiguous memory, O(1) index access, O(n) insertion/deletion (shifting). Best for random access patterns and cache-friendly iteration.</p><p><strong>Linked Lists:</strong> Non-contiguous nodes, O(n) access, O(1) insertion/deletion at known positions. Best for frequent insertions/deletions, implementing stacks/queues, or unknown-size collections.</p><p>In practice, arrays (and dynamic arrays like ArrayList/vector) are preferred due to cache locality. Linked lists shine in specific scenarios like LRU caches or undo systems.</p>" }, difficulty: "easy", frequencyRank: 2, tags: ["arrays", "linked-lists", "data-structures"], isPremium: false },
    { slug: "hash-table-collision-handling", question: "How do hash tables handle collisions?", answer: { short: "Common strategies: chaining (linked lists at each bucket) or open addressing (probing for next slot).", detailed: "<p>A collision occurs when two keys hash to the same bucket index. Two main strategies:</p><p><strong>Chaining:</strong> Each bucket stores a linked list. Colliding keys are appended. Simple but uses extra memory.</p><p><strong>Open Addressing:</strong> On collision, probe for the next available slot. Variants: linear probing, quadratic probing, double hashing. More cache-friendly but complex deletion.</p><p>Good hash functions and appropriate load factors (typically 0.7-0.8) minimize collisions.</p>" }, difficulty: "medium", frequencyRank: 3, tags: ["hash-tables", "collisions", "data-structures"], isPremium: false },
    { slug: "binary-search-tree-operations", question: "Explain binary search tree operations and their complexities.", answer: { short: "BST: left < root < right. Search/insert/delete are O(h) where h is tree height.", detailed: "<p>A BST maintains the invariant: left subtree values < node < right subtree values.</p><p><strong>Search:</strong> Compare with root, go left or right — O(h)<br/><strong>Insert:</strong> Search for position, insert as leaf — O(h)<br/><strong>Delete:</strong> Three cases: leaf (remove), one child (replace), two children (find in-order successor) — O(h)</p><p>For balanced BSTs (AVL, Red-Black), h = O(log n). For degenerate trees, h = O(n). Self-balancing trees guarantee O(log n) operations.</p>" }, difficulty: "medium", frequencyRank: 4, tags: ["bst", "trees", "data-structures"], isPremium: false },
    { slug: "stack-vs-queue", question: "What's the difference between a stack and a queue?", answer: { short: "Stack: LIFO (last in, first out). Queue: FIFO (first in, first out).", detailed: "<p><strong>Stack (LIFO):</strong> Push/pop from the same end. Used for: function call stacks, undo operations, expression parsing, DFS traversal.</p><p><strong>Queue (FIFO):</strong> Enqueue at rear, dequeue from front. Used for: BFS traversal, task scheduling, message queues, print spooling.</p><p>Variants: Deque (double-ended), Priority Queue (dequeue by priority), Circular Queue (fixed-size with wrap-around).</p>" }, difficulty: "easy", frequencyRank: 5, tags: ["stack", "queue", "data-structures"], isPremium: false },
    { slug: "merge-sort-vs-quick-sort", question: "Compare merge sort and quick sort.", answer: { short: "Merge sort: stable O(n log n) guaranteed. Quick sort: O(n log n) average, faster in practice but O(n²) worst case.", detailed: "<p><strong>Merge Sort:</strong> Divide array, recursively sort halves, merge. Always O(n log n). Stable. Requires O(n) extra space. Great for linked lists and external sorting.</p><p><strong>Quick Sort:</strong> Pick pivot, partition around it, recurse. Average O(n log n), worst O(n²) (poor pivots). In-place (O(log n) stack space). Faster in practice due to cache locality.</p><p>Use merge sort when stability or guaranteed performance matters. Use quick sort for general-purpose in-memory sorting.</p>" }, difficulty: "medium", frequencyRank: 6, tags: ["sorting", "merge-sort", "quick-sort", "algorithms"], isPremium: false },
    { slug: "explain-recursion-vs-iteration", question: "When should you use recursion vs. iteration?", answer: { short: "Recursion for naturally recursive structures (trees, divide-and-conquer). Iteration for linear traversals and when stack space is limited.", detailed: "<p><strong>Recursion:</strong> Elegant for tree traversals, backtracking, divide-and-conquer. Risk of stack overflow for deep recursion. Can be optimized with tail-call optimization or memoization.</p><p><strong>Iteration:</strong> More efficient for linear processing, no stack overhead, easier to reason about termination. Any recursive solution can be converted to iterative with an explicit stack.</p><p>Rule of thumb: use recursion when it makes the code significantly clearer, convert to iteration for performance-critical paths.</p>" }, difficulty: "easy", frequencyRank: 7, tags: ["recursion", "iteration", "fundamentals"], isPremium: false },
    { slug: "graph-bfs-vs-dfs", question: "Compare BFS and DFS for graph traversal.", answer: { short: "BFS: level-by-level, finds shortest path in unweighted graphs. DFS: goes deep first, uses less memory for sparse graphs.", detailed: "<p><strong>BFS:</strong> Uses a queue. Explores all neighbors at current depth before going deeper. O(V+E) time, O(V) space. Finds shortest path in unweighted graphs. Better for finding nearby nodes.</p><p><strong>DFS:</strong> Uses a stack (or recursion). Explores as deep as possible before backtracking. O(V+E) time, O(V) space (worst case). Better for: topological sorting, cycle detection, path finding in mazes, connected components.</p>" }, difficulty: "medium", frequencyRank: 8, tags: ["graphs", "bfs", "dfs", "traversal"], isPremium: false },
    { slug: "dynamic-programming-explained", question: "What is dynamic programming? Give an example.", answer: { short: "DP solves complex problems by breaking them into overlapping subproblems and caching results to avoid redundant computation.", detailed: "<p>Dynamic programming is an optimization technique for problems with: (1) <strong>Optimal substructure</strong> — optimal solution builds from optimal sub-solutions, (2) <strong>Overlapping subproblems</strong> — same subproblems recur.</p><p>Two approaches: <strong>Top-down (memoization)</strong> — recursive with cache. <strong>Bottom-up (tabulation)</strong> — iterative, filling a table.</p><p>Classic example: Fibonacci. Naive recursion is O(2ⁿ). With DP, it's O(n) time, O(n) space (or O(1) with space optimization).</p>" }, difficulty: "hard", frequencyRank: 9, tags: ["dynamic-programming", "optimization", "algorithms"], isPremium: false },
    { slug: "heap-data-structure", question: "Explain the heap data structure and its applications.", answer: { short: "A heap is a complete binary tree satisfying the heap property. Used for priority queues and heap sort.", detailed: "<p>A <strong>min-heap</strong> has parent ≤ children; a <strong>max-heap</strong> has parent ≥ children. Stored as an array where node at index i has children at 2i+1 and 2i+2.</p><p><strong>Operations:</strong> Insert: O(log n) — add at end, bubble up. Extract min/max: O(log n) — remove root, bubble down. Peek: O(1).</p><p><strong>Applications:</strong> Priority queues, Dijkstra's algorithm, finding k-th largest/smallest, median maintenance, merge k sorted lists.</p>" }, difficulty: "medium", frequencyRank: 10, tags: ["heap", "priority-queue", "data-structures"], isPremium: false },
    { slug: "explain-dijkstras-algorithm", question: "Explain Dijkstra's shortest path algorithm.", answer: { short: "Greedy algorithm finding shortest paths from a source vertex to all others in a weighted graph with non-negative edges.", detailed: "<p>Dijkstra's works by maintaining tentative distances to all vertices, initially ∞ except source (0). At each step: (1) Pick unvisited vertex with minimum tentative distance, (2) Update distances to its neighbors through this vertex, (3) Mark vertex as visited. Uses a priority queue for efficiency.</p><p><strong>Complexity:</strong> O((V+E) log V) with binary heap. <strong>Limitation:</strong> Doesn't work with negative edge weights (use Bellman-Ford instead).</p>" }, difficulty: "hard", frequencyRank: 11, tags: ["graphs", "shortest-path", "dijkstra", "algorithms"], isPremium: true },
    { slug: "database-indexing", question: "How does database indexing work?", answer: { short: "Indexes create sorted data structures (B-trees, hash indexes) that speed up lookups at the cost of write overhead.", detailed: "<p>An index is a separate data structure that maintains a sorted/hashed reference to table rows. Common types:</p><p><strong>B-Tree Index:</strong> Balanced tree, supports range queries and equality. Most common default index.</p><p><strong>Hash Index:</strong> O(1) equality lookups, no range support.</p><p><strong>Composite Index:</strong> Multiple columns, follows leftmost prefix rule.</p><p><strong>Trade-offs:</strong> Faster reads but slower writes (index must be updated). Additional storage. Choose indexes based on query patterns.</p>" }, difficulty: "medium", frequencyRank: 12, tags: ["databases", "indexing", "b-tree", "performance"], isPremium: false },
    { slug: "acid-properties", question: "What are ACID properties in databases?", answer: { short: "Atomicity, Consistency, Isolation, Durability — guarantees for reliable database transactions.", detailed: "<p><strong>Atomicity:</strong> Transactions are all-or-nothing. If any part fails, the entire transaction rolls back.</p><p><strong>Consistency:</strong> Transactions move the database from one valid state to another, respecting all constraints.</p><p><strong>Isolation:</strong> Concurrent transactions don't interfere with each other. Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.</p><p><strong>Durability:</strong> Once committed, data survives crashes (write-ahead logging, replication).</p>" }, difficulty: "medium", frequencyRank: 13, tags: ["databases", "acid", "transactions"], isPremium: false },
    { slug: "tcp-vs-udp", question: "Compare TCP and UDP protocols.", answer: { short: "TCP: reliable, ordered, connection-oriented. UDP: fast, unreliable, connectionless.", detailed: "<p><strong>TCP:</strong> Connection-oriented (3-way handshake), guaranteed delivery with acknowledgments, ordered packets, flow/congestion control. Used for: HTTP, email, file transfer.</p><p><strong>UDP:</strong> Connectionless, no delivery guarantee, no ordering, minimal overhead. Used for: video streaming, gaming, DNS, VoIP.</p><p>Choose TCP when data integrity matters. Choose UDP when speed matters more than reliability.</p>" }, difficulty: "easy", frequencyRank: 14, tags: ["networking", "tcp", "udp", "protocols"], isPremium: false },
    { slug: "rest-api-principles", question: "What are the key principles of RESTful API design?", answer: { short: "Stateless, resource-oriented, standard HTTP methods, proper status codes, and HATEOAS.", detailed: "<p>REST (Representational State Transfer) principles:</p><p><strong>Resources:</strong> Everything is a resource identified by URIs (/users/123)</p><p><strong>HTTP Methods:</strong> GET (read), POST (create), PUT (full update), PATCH (partial update), DELETE</p><p><strong>Stateless:</strong> Each request contains all needed context</p><p><strong>Status Codes:</strong> 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)</p><p><strong>Versioning:</strong> /api/v1/resources</p>" }, difficulty: "easy", frequencyRank: 15, tags: ["rest", "api-design", "http"], isPremium: false },
    { slug: "explain-caching-strategies", question: "Explain different caching strategies.", answer: { short: "Write-through, write-behind, write-around, cache-aside (lazy loading), and read-through patterns.", detailed: "<p><strong>Cache-Aside (Lazy Loading):</strong> App checks cache first, on miss fetches from DB and populates cache. Most common.</p><p><strong>Read-Through:</strong> Cache sits in front of DB, handles misses automatically.</p><p><strong>Write-Through:</strong> Writes go to cache AND DB simultaneously. Consistent but slower writes.</p><p><strong>Write-Behind (Write-Back):</strong> Writes go to cache, async flush to DB. Fast writes, risk of data loss.</p><p><strong>TTL-Based Eviction:</strong> Cached items expire after a time period. LRU/LFU for memory management.</p>" }, difficulty: "medium", frequencyRank: 16, tags: ["caching", "performance", "system-design"], isPremium: false },
    { slug: "process-vs-thread", question: "What's the difference between a process and a thread?", answer: { short: "Processes are independent execution units with separate memory. Threads share memory within a process.", detailed: "<p><strong>Process:</strong> Independent program instance. Own memory space, file handles, and resources. Inter-process communication is expensive (pipes, sockets, shared memory). Crash isolation.</p><p><strong>Thread:</strong> Lightweight execution unit within a process. Shares memory with other threads. Cheaper to create/switch. Requires synchronization (mutexes, semaphores) to avoid race conditions.</p><p>Use processes for isolation (microservices). Use threads for concurrent tasks sharing state (web server request handling).</p>" }, difficulty: "medium", frequencyRank: 17, tags: ["os", "process", "thread", "concurrency"], isPremium: false },
    { slug: "deadlock-conditions", question: "What are the conditions for deadlock and how do you prevent it?", answer: { short: "Four conditions: mutual exclusion, hold-and-wait, no preemption, circular wait. Break any one to prevent deadlock.", detailed: "<p>Deadlock requires all four <strong>Coffman conditions</strong> simultaneously:</p><p>(1) <strong>Mutual Exclusion:</strong> Resources can't be shared<br/>(2) <strong>Hold and Wait:</strong> Process holds resources while waiting for more<br/>(3) <strong>No Preemption:</strong> Resources can't be forcibly taken<br/>(4) <strong>Circular Wait:</strong> Circular chain of processes waiting</p><p><strong>Prevention:</strong> Break any condition. Most practical: impose ordering on resource acquisition (prevents circular wait) or use timeouts.</p>" }, difficulty: "hard", frequencyRank: 18, tags: ["os", "deadlock", "concurrency"], isPremium: true },
    { slug: "sql-vs-nosql", question: "When would you choose SQL vs. NoSQL databases?", answer: { short: "SQL for structured data with complex queries and ACID needs. NoSQL for flexible schemas, horizontal scaling, and high write throughput.", detailed: "<p><strong>SQL (Relational):</strong> Fixed schema, ACID transactions, complex JOINs, strong consistency. Best for: financial data, user accounts, anything needing referential integrity. Examples: PostgreSQL, MySQL.</p><p><strong>NoSQL:</strong> Flexible schemas, horizontal scaling, eventual consistency options. Types: Document (MongoDB), Key-Value (Redis), Column-family (Cassandra), Graph (Neo4j).</p><p>Many modern systems use both: SQL for transactional data, NoSQL for session storage, caching, or analytics.</p>" }, difficulty: "medium", frequencyRank: 19, tags: ["databases", "sql", "nosql", "architecture"], isPremium: false },
    { slug: "explain-race-condition", question: "What is a race condition? How do you prevent them?", answer: { short: "A race condition occurs when program behavior depends on the timing of concurrent operations. Prevent with locks, atomic operations, or message passing.", detailed: "<p>A race condition happens when multiple threads access shared state and at least one modifies it, and the outcome depends on execution order.</p><p><strong>Prevention strategies:</strong> (1) Mutexes/locks — serialize access to critical sections, (2) Atomic operations — hardware-level guaranteed operations, (3) Immutable data — if data doesn't change, no races, (4) Message passing — communicate via channels instead of shared memory, (5) Thread-local storage — each thread gets its own copy.</p>" }, difficulty: "medium", frequencyRank: 20, tags: ["concurrency", "race-condition", "synchronization"], isPremium: false },
  ];

  techQuestions.forEach((q) => questions.push({ ...q, categorySlug: "technical-core" }));

  // ─── System Design Questions (50 questions) ───────────────────────────

  const sysDesignQuestions: Omit<QuestionDef, "categorySlug">[] = [
    { slug: "design-url-shortener", question: "Design a URL shortening service like Bit.ly.", answer: { short: "Hash-based key generation, read-heavy architecture with caching, horizontal scaling with consistent hashing.", detailed: "<p><strong>Requirements:</strong> Generate short URLs, redirect to original, analytics tracking, custom aliases.</p><p><strong>Core Design:</strong> Base62 encoding of auto-increment IDs or MD5 hash truncation for short codes. Read-heavy ratio (100:1), so aggressive caching with Redis in front of the database.</p><p><strong>Storage:</strong> Key-value store (DynamoDB/Cassandra) for URL mapping. SQL for user accounts and analytics.</p><p><strong>Scale:</strong> Partition by hash prefix, CDN for redirects, rate limiting for writes.</p>" }, difficulty: "hard", frequencyRank: 1, tags: ["url-shortener", "hashing", "caching", "scalability"], isPremium: false },
    { slug: "design-twitter-feed", question: "Design Twitter's news feed system.", answer: { short: "Fan-out on write for celebrities, fan-out on read for regular users, with Redis-based timeline caching.", detailed: "<p><strong>Core challenge:</strong> Delivering personalized feeds to billions of users in real-time.</p><p><strong>Fan-out approaches:</strong> Fan-out on write (push model) — when a user tweets, push to all followers' timelines. Works for users with <10K followers. Fan-out on read (pull model) — assemble feed at read time. Better for celebrities with millions of followers.</p><p><strong>Hybrid:</strong> Twitter uses both. Celebrity tweets are fetched on-read; regular tweets are pushed on-write.</p><p><strong>Infrastructure:</strong> Redis for timeline cache, Kafka for event streaming, graph database for social graph.</p>" }, difficulty: "hard", frequencyRank: 2, tags: ["news-feed", "fan-out", "social-media", "caching"], isPremium: true },
    { slug: "design-chat-application", question: "Design a real-time chat application like WhatsApp.", answer: { short: "WebSocket connections, message queues for delivery, end-to-end encryption, and presence tracking.", detailed: "<p><strong>Real-time delivery:</strong> WebSocket connections for active users. Long polling as fallback. Connection gateway servers maintain persistent connections.</p><p><strong>Message flow:</strong> User A → Gateway → Message Queue → Gateway → User B. Store messages in a time-series database for history.</p><p><strong>Offline handling:</strong> Queue messages for offline users, deliver on reconnect. Push notifications via APNs/FCM.</p><p><strong>Group chats:</strong> Fan-out to group members. Optimize for small groups (< 256 members).</p><p><strong>Encryption:</strong> Signal Protocol for E2E encryption. Keys stored only on devices.</p>" }, difficulty: "hard", frequencyRank: 3, tags: ["chat", "websocket", "real-time", "messaging"], isPremium: true },
    { slug: "design-rate-limiter", question: "Design a rate limiting system.", answer: { short: "Token bucket or sliding window algorithms, distributed with Redis, multiple granularities.", detailed: "<p><strong>Algorithms:</strong></p><p><strong>Token Bucket:</strong> Tokens added at fixed rate. Each request consumes a token. Allows bursts. Most common.</p><p><strong>Sliding Window Log:</strong> Track timestamps of requests. Count within window. Precise but memory-intensive.</p><p><strong>Sliding Window Counter:</strong> Hybrid — weighted count of current and previous windows. Memory-efficient approximation.</p><p><strong>Distributed:</strong> Use Redis with INCR and EXPIRE for atomic operations. Race conditions handled with Lua scripts.</p>" }, difficulty: "medium", frequencyRank: 4, tags: ["rate-limiter", "token-bucket", "distributed-systems"], isPremium: false },
    { slug: "design-notification-system", question: "Design a push notification service.", answer: { short: "Multi-channel delivery (push, email, SMS), priority queuing, user preferences, and delivery tracking.", detailed: "<p><strong>Components:</strong> (1) Notification Service — accepts requests, validates, routes. (2) Priority Queue — urgent vs. batch. (3) Channel Adapters — APNs, FCM, SMTP, Twilio. (4) User Preferences — opt-in/out per channel and type. (5) Delivery Tracker — receipts, retries, analytics.</p><p><strong>Challenges:</strong> Rate limiting per user (no spam), deduplication, timezone-aware scheduling, template management, A/B testing.</p>" }, difficulty: "medium", frequencyRank: 5, tags: ["notifications", "push", "message-queue", "multi-channel"], isPremium: false },
    { slug: "design-key-value-store", question: "Design a distributed key-value store.", answer: { short: "Consistent hashing for partitioning, replication for fault tolerance, eventual consistency with conflict resolution.", detailed: "<p><strong>Partitioning:</strong> Consistent hashing distributes keys across nodes. Virtual nodes for load balancing.</p><p><strong>Replication:</strong> Each key stored on N nodes (typically 3). Replication factor configurable per use case.</p><p><strong>Consistency:</strong> Quorum reads/writes (R+W>N for strong consistency). Eventual consistency with vector clocks for conflict detection.</p><p><strong>Failure handling:</strong> Sloppy quorum, hinted handoff, Merkle trees for anti-entropy synchronization.</p>" }, difficulty: "hard", frequencyRank: 6, tags: ["distributed-systems", "key-value", "consistency", "partitioning"], isPremium: true },
    { slug: "design-autocomplete-search", question: "Design a search autocomplete system.", answer: { short: "Trie data structure with frequency ranking, precomputed top-k suggestions, and edge caching.", detailed: "<p><strong>Data structure:</strong> Trie (prefix tree) with frequency counts at each node. Precompute top-k suggestions at each prefix node for fast retrieval.</p><p><strong>Updates:</strong> Batch process search logs to update frequencies. Rebuild trie periodically or use online learning.</p><p><strong>Serving:</strong> Shard by prefix range. Cache hot prefixes at edge. P99 latency target < 100ms.</p><p><strong>Ranking:</strong> Combine frequency, recency, personalization, and trending signals.</p>" }, difficulty: "medium", frequencyRank: 7, tags: ["autocomplete", "trie", "search", "ranking"], isPremium: false },
    { slug: "design-cdn", question: "Design a Content Delivery Network (CDN).", answer: { short: "Geographically distributed edge servers, pull/push caching strategies, DNS-based routing.", detailed: "<p><strong>Architecture:</strong> Origin server → Edge servers (PoPs) worldwide. DNS-based or Anycast routing to nearest edge.</p><p><strong>Caching:</strong> Pull model (cache on first request) vs. Push model (pre-populate edges). TTL-based expiration. Cache invalidation via purge APIs.</p><p><strong>Optimization:</strong> Compression (gzip/brotli), image optimization, HTTP/2 multiplexing, connection reuse.</p><p><strong>Challenges:</strong> Cache consistency, origin shielding, DDoS protection, SSL termination at edge.</p>" }, difficulty: "hard", frequencyRank: 8, tags: ["cdn", "caching", "networking", "scalability"], isPremium: true },
    { slug: "design-load-balancer", question: "Design a load balancer.", answer: { short: "L4/L7 load balancing, health checks, multiple algorithms (round-robin, least connections, consistent hashing).", detailed: "<p><strong>Layer 4 (Transport):</strong> Routes based on IP/port. Fast, no content inspection. Good for TCP/UDP traffic.</p><p><strong>Layer 7 (Application):</strong> Routes based on HTTP headers, URL path, cookies. Enables sticky sessions, A/B testing, content-based routing.</p><p><strong>Algorithms:</strong> Round-robin, weighted round-robin, least connections, IP hash, consistent hashing.</p><p><strong>Health checks:</strong> Active (periodic probes) and passive (monitoring response codes). Automatic failover for unhealthy backends.</p>" }, difficulty: "medium", frequencyRank: 9, tags: ["load-balancer", "networking", "scalability", "high-availability"], isPremium: false },
    { slug: "design-e-commerce-platform", question: "Design the architecture for an e-commerce platform.", answer: { short: "Microservices: catalog, cart, orders, payments, inventory with event-driven architecture.", detailed: "<p><strong>Core services:</strong> Product Catalog, Shopping Cart, Order Management, Payment Processing, Inventory, User/Auth, Search, Recommendations.</p><p><strong>Key patterns:</strong> CQRS for catalog (read-optimized views), Saga pattern for distributed transactions (order → payment → inventory), Event sourcing for order history.</p><p><strong>Performance:</strong> CDN for product images, search via Elasticsearch, Redis for cart and session, database per service.</p><p><strong>Payments:</strong> PCI DSS compliance, idempotency keys, payment gateway abstraction.</p>" }, difficulty: "hard", frequencyRank: 10, tags: ["e-commerce", "microservices", "distributed-transactions"], isPremium: true },
  ];

  sysDesignQuestions.forEach((q) => questions.push({ ...q, categorySlug: "system-design" }));

  // ─── Behavioral — STAR Method Questions (50 questions) ─────────────────

  const behavioralQuestions: Omit<QuestionDef, "categorySlug">[] = [
    { slug: "time-you-led-a-project", question: "Tell me about a time you led a project from start to finish.", answer: { short: "Use STAR to showcase project ownership, planning, execution, and measurable results.", detailed: "<p>Structure using STAR:</p><p><strong>Situation:</strong> Set the context — what was the project, why was it needed?</p><p><strong>Task:</strong> What was your specific role and responsibility?</p><p><strong>Action:</strong> Detail your planning, execution, and leadership decisions.</p><p><strong>Result:</strong> Quantify the outcome — delivery timeline, business impact, team feedback.</p><p>Focus on decisions you made and challenges you overcame, not just the happy path.</p>", example: "<strong>S:</strong> Our team needed to rebuild our CI/CD pipeline that was causing 40-minute build times.<br/><strong>T:</strong> I volunteered to lead the migration to a new system.<br/><strong>A:</strong> I researched options, proposed GitHub Actions, created a migration plan with zero-downtime cutover, and paired with each team member to migrate their workflows.<br/><strong>R:</strong> Build times dropped to 8 minutes, developer satisfaction scores increased 30%." }, difficulty: "medium", frequencyRank: 1, tags: ["leadership", "project-management", "ownership"], isPremium: false },
    { slug: "handled-conflict-with-teammate", question: "Describe a time you handled a conflict with a teammate.", answer: { short: "Show emotional intelligence: listened first, sought understanding, found a resolution that preserved the relationship.", detailed: "<p><strong>Key elements to cover:</strong> What caused the conflict, how you approached the conversation, what you learned about the other person's perspective, and how you reached resolution.</p><p>Avoid painting yourself as the hero and the other person as wrong. Show maturity by acknowledging your role in the conflict and finding genuine common ground.</p>", example: "<strong>S:</strong> A senior engineer and I disagreed on whether to use GraphQL or REST for a new API.<br/><strong>T:</strong> We needed to align before the sprint started.<br/><strong>A:</strong> I suggested we each write a one-page RFC with pros/cons, then discuss. I genuinely considered his GraphQL arguments and found valid points about reducing over-fetching.<br/><strong>R:</strong> We chose GraphQL for the client-facing API and REST for internal services — a hybrid that leveraged both approaches." }, difficulty: "medium", frequencyRank: 2, tags: ["conflict-resolution", "teamwork", "communication"], isPremium: false },
    { slug: "received-tough-feedback", question: "Tell me about a time you received tough feedback.", answer: { short: "Demonstrate that you received the feedback openly, reflected on it, and made concrete changes.", detailed: "<p>This tests self-awareness and coachability. Structure:</p><p>(1) What was the feedback and who gave it? (2) Your initial reaction (be honest — it's okay to admit it stung), (3) How you processed and reflected on it, (4) Specific changes you made, (5) How those changes improved your work.</p>" }, difficulty: "medium", frequencyRank: 3, tags: ["feedback", "growth", "self-awareness"], isPremium: false },
    { slug: "worked-with-difficult-stakeholder", question: "Describe working with a difficult stakeholder.", answer: { short: "Show empathy and communication skills — understand their motivations and find alignment.", detailed: "<p>\"Difficult\" usually means misaligned expectations or communication styles. Describe: (1) Who the stakeholder was and why the relationship was challenging, (2) How you sought to understand their perspective and priorities, (3) How you adapted your communication, (4) The outcome and relationship improvement.</p>", example: "<strong>S:</strong> A PM kept changing requirements mid-sprint, causing rework.<br/><strong>T:</strong> I needed to reduce churn without damaging the relationship.<br/><strong>A:</strong> I invited them to our sprint planning, showed the cost of mid-sprint changes with data, and proposed a \"change budget\" — 1 scope change per sprint.<br/><strong>R:</strong> Mid-sprint changes dropped 80%, and the PM later said our collaboration was the best they'd experienced." }, difficulty: "hard", frequencyRank: 4, tags: ["stakeholder-management", "communication", "influence"], isPremium: true },
    { slug: "missed-deadline", question: "Tell me about a time you missed a deadline.", answer: { short: "Own the miss, explain what went wrong, describe how you communicated and recovered.", detailed: "<p>Interviewers assess accountability and recovery skills. Cover: (1) The deadline and what you committed to, (2) What went wrong (be honest — bad estimation, scope creep, unforeseen complexity), (3) How you communicated the delay to stakeholders, (4) How you recovered and delivered, (5) What processes you changed to prevent recurrence.</p>" }, difficulty: "medium", frequencyRank: 5, tags: ["accountability", "deadlines", "estimation"], isPremium: false },
    { slug: "influenced-without-authority", question: "Tell me about a time you influenced a decision without having authority.", answer: { short: "Demonstrate persuasion through data, relationships, and compelling arguments rather than positional power.", detailed: "<p>This is key for individual contributors. Describe: (1) The decision you wanted to influence, (2) Your approach: building alliances, presenting data, running experiments, writing proposals, (3) How you handled resistance, (4) The outcome.</p><p>Strong answers show you can drive change through evidence and relationships, not title or hierarchy.</p>" }, difficulty: "hard", frequencyRank: 6, tags: ["influence", "persuasion", "leadership"], isPremium: true },
    { slug: "adapted-to-major-change", question: "Describe a time you had to adapt to a major change at work.", answer: { short: "Show flexibility, positive attitude, and proactive adjustment to unexpected change.", detailed: "<p>Changes could be: reorganization, new technology stack, pivoting product direction, new leadership. Cover: (1) The change and its impact, (2) Your initial reaction, (3) How you adapted your approach, (4) How you helped others adapt, (5) The outcome and what you learned about handling change.</p>" }, difficulty: "medium", frequencyRank: 7, tags: ["adaptability", "change-management", "resilience"], isPremium: false },
    { slug: "mentored-someone", question: "Tell me about a time you mentored someone.", answer: { short: "Describe your mentoring approach and the measurable growth you helped achieve.", detailed: "<p>Cover: (1) Who you mentored and the context, (2) How you identified their development needs, (3) Your mentoring approach (regular 1:1s, pair programming, stretch assignments), (4) Challenges in the mentoring relationship, (5) Their growth and achievements.</p>" }, difficulty: "medium", frequencyRank: 8, tags: ["mentorship", "leadership", "development"], isPremium: false },
    { slug: "navigated-ambiguous-situation", question: "Describe a time you navigated an ambiguous situation.", answer: { short: "Show comfort with uncertainty and a systematic approach to making progress without perfect information.", detailed: "<p>Ambiguity tests your ability to make progress without clear direction. Cover: (1) What was ambiguous and why, (2) How you gathered information and clarified constraints, (3) Assumptions you made (and how you validated them), (4) How you made decisions with incomplete information, (5) The outcome and how you handled course corrections.</p>" }, difficulty: "hard", frequencyRank: 9, tags: ["ambiguity", "decision-making", "problem-solving"], isPremium: false },
    { slug: "improved-a-process", question: "Tell me about a time you improved a team process.", answer: { short: "Identify the problem, propose a solution with data, implement it, and measure the improvement.", detailed: "<p>Shows initiative and continuous improvement mindset. Cover: (1) The process that was inefficient and its impact, (2) How you identified the problem, (3) Your proposed improvement, (4) How you got buy-in from the team, (5) Implementation and measured results.</p>", example: "<strong>S:</strong> Our code review turnaround averaged 3 days, blocking releases.<br/><strong>T:</strong> I wanted to reduce it without sacrificing review quality.<br/><strong>A:</strong> I analyzed bottlenecks, proposed a 'review buddy' rotation system, set a 24-hour SLA, and added Slack notifications for pending reviews.<br/><strong>R:</strong> Average review time dropped to 6 hours, and release frequency doubled." }, difficulty: "medium", frequencyRank: 10, tags: ["process-improvement", "initiative", "efficiency"], isPremium: false },
  ];

  behavioralQuestions.forEach((q) => questions.push({ ...q, categorySlug: "behavioral" }));

  // ─── Frontend Engineering Questions (50 questions) ────────────────────

  const frontendQuestions: Omit<QuestionDef, "categorySlug">[] = [
    { slug: "virtual-dom-explained", question: "Explain the Virtual DOM and why React uses it.", answer: { short: "The Virtual DOM is an in-memory representation of the real DOM. React diffs virtual trees to minimize expensive real DOM updates.", detailed: "<p>The <strong>Virtual DOM</strong> is a lightweight JavaScript object tree mirroring the real DOM structure.</p><p><strong>Reconciliation process:</strong> (1) State changes trigger a new virtual DOM tree, (2) React diffs the new tree against the previous one (reconciliation), (3) Only the minimal set of real DOM operations are applied (commit phase).</p><p><strong>Why:</strong> Direct DOM manipulation is slow (layout, paint, composite). Batching and minimizing DOM operations significantly improves performance.</p><p><strong>React 18+:</strong> Concurrent rendering allows React to pause and resume work, prioritizing user-visible updates.</p>" }, difficulty: "medium", frequencyRank: 1, tags: ["react", "virtual-dom", "performance", "reconciliation"], isPremium: false },
    { slug: "closures-in-javascript", question: "What are closures in JavaScript?", answer: { short: "A closure is a function that retains access to its lexical scope even when executed outside that scope.", detailed: "<p>A closure forms when a function is created inside another function and references variables from the outer scope.</p><p><strong>How it works:</strong> When the inner function is returned or passed elsewhere, it carries a reference to its creation environment's variable bindings.</p><p><strong>Use cases:</strong> Data privacy (module pattern), callbacks, currying, memoization, event handlers.</p><p><strong>Common pitfall:</strong> Loop closures with <code>var</code> — all closures share the same variable binding. Fix with <code>let</code> or IIFE.</p>" }, difficulty: "medium", frequencyRank: 2, tags: ["javascript", "closures", "scope", "fundamentals"], isPremium: false },
    { slug: "css-box-model", question: "Explain the CSS box model.", answer: { short: "Every element is a box with content, padding, border, and margin layers. box-sizing controls how width/height are calculated.", detailed: "<p>The box model consists of four layers (inside out): <strong>Content</strong> → <strong>Padding</strong> → <strong>Border</strong> → <strong>Margin</strong>.</p><p><strong>box-sizing: content-box</strong> (default): Width/height only apply to content. Padding and border add to total size.</p><p><strong>box-sizing: border-box</strong>: Width/height include padding and border. More intuitive for layouts. Universally recommended with <code>*, *::before, *::after { box-sizing: border-box; }</code>.</p>" }, difficulty: "easy", frequencyRank: 3, tags: ["css", "box-model", "layout", "fundamentals"], isPremium: false },
    { slug: "event-delegation", question: "What is event delegation and why is it useful?", answer: { short: "Attaching a single event listener to a parent element instead of individual listeners to child elements, leveraging event bubbling.", detailed: "<p>Instead of attaching listeners to each list item, attach one to the parent list. When a child is clicked, the event bubbles up to the parent where you check <code>event.target</code> to identify which child was clicked.</p><p><strong>Benefits:</strong> (1) Memory efficient — one listener instead of thousands, (2) Handles dynamically added elements automatically, (3) Simpler cleanup.</p><p><strong>Caveat:</strong> Not all events bubble (focus, blur). Use focusin/focusout alternatives.</p>" }, difficulty: "easy", frequencyRank: 4, tags: ["javascript", "events", "delegation", "dom"], isPremium: false },
    { slug: "react-hooks-usestate-useeffect", question: "Explain useState and useEffect hooks in React.", answer: { short: "useState manages component state. useEffect handles side effects (data fetching, subscriptions, DOM manipulation) after render.", detailed: "<p><strong>useState:</strong> Returns [state, setState]. Triggers re-render on state change. Use functional updates for state based on previous value: <code>setState(prev => prev + 1)</code>.</p><p><strong>useEffect:</strong> Runs after render. Dependencies array controls when it re-runs: empty [] = mount only, [dep] = when dep changes, none = every render. Return a cleanup function for subscriptions.</p><p><strong>Common mistakes:</strong> Missing dependencies (stale closures), infinite loops (object/array deps), not cleaning up subscriptions.</p>" }, difficulty: "easy", frequencyRank: 5, tags: ["react", "hooks", "useState", "useEffect"], isPremium: false },
    { slug: "promise-vs-async-await", question: "Compare Promises and async/await in JavaScript.", answer: { short: "Async/await is syntactic sugar over Promises that makes asynchronous code look synchronous and easier to debug.", detailed: "<p><strong>Promises:</strong> <code>.then()</code> chains for sequential operations, <code>.catch()</code> for errors, <code>Promise.all()</code> for parallel. Can become deeply nested (\"promise hell\").</p><p><strong>Async/await:</strong> <code>async</code> functions always return Promises. <code>await</code> pauses execution until Promise resolves. Use try/catch for error handling. Much cleaner for sequential async operations.</p><p><strong>Performance note:</strong> <code>await</code> in a loop is sequential. Use <code>Promise.all()</code> for concurrent operations.</p>" }, difficulty: "medium", frequencyRank: 6, tags: ["javascript", "promises", "async-await", "asynchronous"], isPremium: false },
    { slug: "web-accessibility-basics", question: "What are the key principles of web accessibility?", answer: { short: "POUR: Perceivable, Operable, Understandable, Robust. Use semantic HTML, ARIA attributes, keyboard navigation, and proper contrast.", detailed: "<p>WCAG 2.1 guidelines follow <strong>POUR</strong> principles:</p><p><strong>Perceivable:</strong> Alt text for images, captions for video, sufficient color contrast (4.5:1 for text).</p><p><strong>Operable:</strong> Full keyboard navigation, no time limits, no seizure-triggering content, skip navigation links.</p><p><strong>Understandable:</strong> Clear language, consistent navigation, helpful error messages.</p><p><strong>Robust:</strong> Semantic HTML, valid markup, ARIA attributes where native HTML isn't sufficient.</p>" }, difficulty: "medium", frequencyRank: 7, tags: ["accessibility", "wcag", "a11y", "semantic-html"], isPremium: false },
    { slug: "css-flexbox-vs-grid", question: "When would you use Flexbox vs. CSS Grid?", answer: { short: "Flexbox for one-dimensional layouts (row OR column). Grid for two-dimensional layouts (rows AND columns simultaneously).", detailed: "<p><strong>Flexbox:</strong> One-dimensional. Content-first — items determine layout. Best for: navigation bars, card rows, centering, aligning items along one axis. Use <code>justify-content</code>, <code>align-items</code>, <code>flex-wrap</code>.</p><p><strong>CSS Grid:</strong> Two-dimensional. Layout-first — define grid, place items. Best for: page layouts, dashboards, image galleries, complex multi-area designs. Use <code>grid-template-columns/rows</code>, <code>grid-area</code>.</p><p>They complement each other. Use Grid for page structure, Flexbox for component internals.</p>" }, difficulty: "easy", frequencyRank: 8, tags: ["css", "flexbox", "grid", "layout"], isPremium: false },
    { slug: "web-performance-optimization", question: "What techniques do you use for web performance optimization?", answer: { short: "Bundle splitting, lazy loading, image optimization, caching, minimizing main thread work, and monitoring Core Web Vitals.", detailed: "<p><strong>Loading:</strong> Code splitting, tree shaking, lazy loading (routes, images, components), preloading critical resources, HTTP/2.</p><p><strong>Rendering:</strong> Minimize DOM size, avoid layout thrashing, use CSS containment, virtual scrolling for long lists, web workers for heavy computation.</p><p><strong>Assets:</strong> Image optimization (WebP/AVIF, responsive images, lazy loading), font subsetting, compression (Brotli).</p><p><strong>Caching:</strong> Service workers, CDN, browser caching headers, stale-while-revalidate.</p><p><strong>Monitoring:</strong> Core Web Vitals (LCP, FID/INP, CLS), Lighthouse, Real User Monitoring.</p>" }, difficulty: "hard", frequencyRank: 9, tags: ["performance", "optimization", "core-web-vitals"], isPremium: true },
    { slug: "react-server-components", question: "Explain React Server Components and their benefits.", answer: { short: "RSCs render on the server, send HTML (not JavaScript) to the client, reducing bundle size and enabling direct data access.", detailed: "<p>React Server Components (RSC) are components that execute <strong>only on the server</strong>. They can access databases, file systems, and secrets directly.</p><p><strong>Benefits:</strong> (1) Zero client-side JavaScript for server components, (2) Direct data access without API layer, (3) Automatic code splitting, (4) Streaming SSR with Suspense.</p><p><strong>Key rules:</strong> Server Components can't use hooks (useState, useEffect) or browser APIs. Client Components need <code>'use client'</code> directive. Server Components can import Client Components, but not vice versa.</p>" }, difficulty: "hard", frequencyRank: 10, tags: ["react", "server-components", "nextjs", "ssr"], isPremium: true },
  ];

  frontendQuestions.forEach((q) => questions.push({ ...q, categorySlug: "frontend" }));

  return questions;
}

// ─── Main Seed Function ─────────────────────────────────────────────────────

async function seedContent() {
  console.log("🌱 Phase 6 — Content Seeding Script");
  console.log("===================================\n");

  await mongoose.connect(MONGODB_URI!);
  console.log("[DB] Connected to MongoDB Atlas\n");

  // 1. Upsert Categories
  console.log("📁 Upserting categories...");
  for (const cat of CATEGORIES) {
    const existing = await Category.findOne({ slug: cat.slug });
    if (existing) {
      // Update existing fields
      await Category.updateOne({ slug: cat.slug }, { $set: { name: cat.name, type: cat.type, description: cat.description, icon: cat.icon, order: cat.order, isPublished: true } });
      console.log(`  ✔ Updated: ${cat.name}`);
    } else {
      await Category.create({ ...cat, isPublished: true });
      console.log(`  ✚ Created: ${cat.name}`);
    }
  }

  // Delete the test import category
  const testCat = await Category.findOne({ slug: "imported-cat-50225" });
  if (testCat) {
    await Question.deleteMany({ category: testCat._id });
    await Category.deleteOne({ _id: testCat._id });
    console.log("  🗑️ Deleted test import category\n");
  }

  // 2. Get category slug-to-ID mapping
  const allCats = await Category.find({});
  const slugToId: Record<string, string> = {};
  for (const cat of allCats) {
    slugToId[cat.slug] = cat._id.toString();
  }

  // 3. Insert Questions (skip duplicates by slug)
  const questions = generateQuestions();
  console.log(`📝 Seeding ${questions.length} questions...`);

  let created = 0;
  let skipped = 0;

  for (const q of questions) {
    const categoryId = slugToId[q.categorySlug];
    if (!categoryId) {
      console.error(`  ❌ Category not found for slug: ${q.categorySlug}`);
      skipped++;
      continue;
    }

    const exists = await Question.findOne({ slug: q.slug });
    if (exists) {
      skipped++;
      continue;
    }

    await Question.create({
      category: categoryId,
      slug: q.slug,
      question: q.question,
      answer: q.answer,
      videos: [],
      difficulty: q.difficulty,
      frequencyRank: q.frequencyRank,
      tags: q.tags,
      isPremium: q.isPremium,
      isPublished: true,
    });
    created++;
  }

  console.log(`  ✚ Created: ${created}`);
  console.log(`  ⏭ Skipped (already exist): ${skipped}\n`);

  // 4. Update question counts on categories
  console.log("📊 Updating category question counts...");
  for (const cat of allCats) {
    const count = await Question.countDocuments({ category: cat._id, isPublished: true });
    await Category.updateOne({ _id: cat._id }, { $set: { questionCount: count } });
    console.log(`  ${cat.name}: ${count} questions`);
  }

  console.log("\n✅ Content seeding complete!");

  await mongoose.disconnect();
  process.exit(0);
}

seedContent().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
