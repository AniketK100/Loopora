/**
 * Gemini AI Service Implementation
 *
 * Implements the AIService interface using the official @google/genai SDK.
 * Reads API key strictly from environment variables.
 *
 * @module lib/ai/gemini
 */

import { GoogleGenAI } from "@google/genai";
import { AIService, ResumeAnalysisSummary, ClassificationResult, QualityResult } from "./types";

export class GeminiService implements AIService {
  private ai: GoogleGenAI;
  private modelName = "gemini-2.5-flash";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeResume(extractedText: string): Promise<ResumeAnalysisSummary> {
    const prompt = `You are an expert ATS (Applicant Tracking System) parser. Analyze the following resume text and extract the target role, key skills, and total estimated years of professional experience.

    Resume Text:
    ${extractedText}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            detectedRole: { type: "STRING" },
            skills: { type: "ARRAY", items: { type: "STRING" } },
            yearsExperience: { type: "INTEGER" },
          },
          required: ["detectedRole", "skills", "yearsExperience"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini during resume analysis.");
    }

    return JSON.parse(text) as ResumeAnalysisSummary;
  }

  async classifyDocument(extractedText: string): Promise<ClassificationResult> {
    const prompt = `You are a document classifier. Analyze the following text and determine if it is a resume/CV.

    Return:
    - isResume: true if it is a resume, false otherwise
    - confidence: a number between 0 and 1 indicating how confident you are
    - label: one of "resume", "cover_letter", "transcript", "certificate", "article", "other"
    - reasons: an array of strings explaining your classification

    Text to classify:
    ${extractedText.substring(0, 5000)}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            isResume: { type: "BOOLEAN" },
            confidence: { type: "NUMBER" },
            label: { type: "STRING" },
            reasons: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["isResume", "confidence", "label", "reasons"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini during document classification.");
    }

    return JSON.parse(text) as ClassificationResult;
  }

  async analyzeResumeQuality(extractedText: string): Promise<QualityResult> {
    const prompt = `You are a professional resume reviewer. Analyze the following resume and provide:
    - score: a quality score from 0 to 100
    - missingSections: an array of important sections that are missing (e.g., "contact_info", "education", "experience", "skills", "projects", "summary", "certifications")
    - suggestions: an array of actionable suggestions to improve the resume

    Resume Text:
    ${extractedText.substring(0, 8000)}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: { type: "NUMBER" },
            missingSections: { type: "ARRAY", items: { type: "STRING" } },
            suggestions: { type: "ARRAY", items: { type: "STRING" } },
          },
          required: ["score", "missingSections", "suggestions"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini during resume quality analysis.");
    }

    const result = JSON.parse(text) as QualityResult;
    result.score = Math.max(0, Math.min(100, Math.round(result.score)));
    return result;
  }

  async generatePersonalizedAnswer(
    question: string,
    sampleAnswer: string,
    resumeExtractedText: string
  ): Promise<string> {
    const prompt = `You are a premium career coach helping a candidate prepare for an interview.
    Given the interview question and its canonical sample answer, personalize the response based on the candidate's resume.
    Highlight how their background, projects, or specific skills mentioned in their resume make them an excellent fit.

    Requirements:
    1. Speak in the first person ("I", "my").
    2. Integrate real achievements or technologies from their resume seamlessly.
    3. Be professional, punchy, and formatted in clean HTML (e.g. using <p>, <ul>, <li>, <strong>, <em> tags). Do not use markdown and do not wrap in markdown code blocks like \`\`\`html.
    4. Keep the text between 150 to 300 words.

    Question:
    ${question}

    Canonical Sample Answer:
    ${sampleAnswer}

    Candidate Resume Context:
    ${resumeExtractedText}`;

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini during personalized answer generation.");
    }

    return text.replace(/^```html\s*/i, "").replace(/```$/i, "").trim();
  }
}
