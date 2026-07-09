/**
 * Resume Classifier — Heuristic Engine
 *
 * Analyzes extracted text using regex-based heuristics to detect
 * whether a document is a resume. Returns signals and a composite score.
 *
 * @module lib/classification/resumeClassifier
 */

export interface HeuristicSignals {
  hasEmail: boolean;
  hasPhone: boolean;
  hasEducation: boolean;
  hasWorkHistory: boolean;
  hasSkills: boolean;
  hasProjects: boolean;
  hasContactInfo: boolean;
  textLength: number;
  sectionCount: number;
  keywordHits: number;
}

export interface ClassificationResult {
  isResume: boolean;
  confidence: number;
  heuristicScore: number;
  signals: HeuristicSignals;
  reasons: string[];
}

const RESUME_KEYWORDS = [
  "resume", "curriculum vitae", "cv", "experience", "education",
  "skills", "qualification", "employment", "career", "objective",
  "summary", "references", "certifications", "projects", "internship",
  "bachelor", "master", "phd", "university", "college",
  "developer", "engineer", "manager", "analyst", "designer",
  "years of experience", "proficient", "technologies", "frameworks",
];

const SECTION_HEADERS = [
  /(?:^|\n)\s*(?:education|academic|qualification)/i,
  /(?:^|\n)\s*(?:experience|work\s+experience|employment|professional\s+experience)/i,
  /(?:^|\n)\s*(?:skills|technical\s+skills|competencies|technologies)/i,
  /(?:^|\n)\s*(?:projects|portfolio|personal\s+projects)/i,
  /(?:^|\n)\s*(?:certifications?|licenses?|credentials?)/i,
  /(?:^|\n)\s*(?:summary|profile|objective|about\s+me)/i,
  /(?:^|\n)\s*(?:references?|awards?|honors?)/i,
];

/**
 * Runs heuristic signals on extracted text to produce a classification score.
 */
export function classifyByHeuristics(text: string): ClassificationResult {
  const reasons: string[] = [];
  let score = 0;

  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.]{2,}/.test(text);
  if (hasEmail) { score += 0.15; reasons.push("Contains email address"); }

  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text);
  if (hasPhone) { score += 0.1; reasons.push("Contains phone number"); }

  const hasEducation = /(?:b\.?s\.?|bachelor|m\.?s\.?|master|ph\.?d|university|college|degree|gpa)/i.test(text);
  if (hasEducation) { score += 0.15; reasons.push("Contains education info"); }

  const hasWorkHistory = /(?:experience|employment|worked at|position|role|job title|company)/i.test(text);
  if (hasWorkHistory) { score += 0.15; reasons.push("Contains work history"); }

  const hasSkills = /(?:skills|proficient in|technologies|programming|tools|frameworks)/i.test(text);
  if (hasSkills) { score += 0.15; reasons.push("Contains skills section"); }

  const hasProjects = /(?:projects?|portfolio|github|built|developed|created)/i.test(text);
  if (hasProjects) { score += 0.1; reasons.push("Contains projects"); }

  const hasContactInfo = hasEmail || hasPhone || /(?:linkedin|location|address)/i.test(text);
  if (hasContactInfo) { score += 0.05; }

  const textLength = text.length;

  // Count section headers
  let sectionCount = 0;
  for (const header of SECTION_HEADERS) {
    if (header.test(text)) sectionCount++;
  }
  if (sectionCount >= 3) { score += 0.1; reasons.push(`Found ${sectionCount} resume sections`); }

  // Keyword hits
  const lowerText = text.toLowerCase();
  let keywordHits = 0;
  for (const kw of RESUME_KEYWORDS) {
    if (lowerText.includes(kw)) keywordHits++;
  }
  if (keywordHits >= 5) { score += 0.1; reasons.push(`${keywordHits} resume keywords detected`); }

  // Penalize very short text
  if (textLength < 200) { score *= 0.3; reasons.push("Very short text content"); }
  else if (textLength < 500) { score *= 0.7; reasons.push("Short text content"); }

  const confidence = Math.min(score, 1);

  return {
    isResume: confidence >= 0.4,
    confidence,
    heuristicScore: score,
    signals: {
      hasEmail,
      hasPhone,
      hasEducation,
      hasWorkHistory,
      hasSkills,
      hasProjects,
      hasContactInfo,
      textLength,
      sectionCount,
      keywordHits,
    },
    reasons,
  };
}
