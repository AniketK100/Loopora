/**
 * AI Provider Types
 *
 * Defines the service interfaces and data transfer models for AI services.
 * Allows switching providers (Gemini, OpenAI) without modifying business logic.
 *
 * @module lib/ai/types
 */

export interface ResumeAnalysisSummary {
  detectedRole: string;
  skills: string[];
  yearsExperience: number;
}

export interface ClassificationResult {
  isResume: boolean;
  confidence: number;
  label: string;
  reasons: string[];
}

export interface QualityResult {
  score: number;
  missingSections: string[];
  suggestions: string[];
}

export interface AIService {
  analyzeResume(extractedText: string): Promise<ResumeAnalysisSummary>;
  classifyDocument(extractedText: string): Promise<ClassificationResult>;
  analyzeResumeQuality(extractedText: string): Promise<QualityResult>;
  generatePersonalizedAnswer(
    question: string,
    sampleAnswer: string,
    resumeExtractedText: string
  ): Promise<string>;
}
