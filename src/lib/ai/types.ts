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

export interface AIService {
  analyzeResume(extractedText: string): Promise<ResumeAnalysisSummary>;
  analyzeResumeImage(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<{ extractedText: string; summary: ResumeAnalysisSummary }>;
  generatePersonalizedAnswer(
    question: string,
    sampleAnswer: string,
    resumeExtractedText: string
  ): Promise<string>;
}
