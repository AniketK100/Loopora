/**
 * Gemini AI Service Implementation
 *
 * Implements the AIService interface using the official @google/genai SDK.
 * Reads API key strictly from environment variables.
 *
 * @module lib/ai/gemini
 */

import { GoogleGenAI } from "@google/genai";
import { AIService, ResumeAnalysisSummary } from "./types";

export class GeminiService implements AIService {
  private ai: GoogleGenAI;
  private modelName = "gemini-2.5-flash";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // In development, default to a placeholder or fail safely if not running AI actions yet
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

  async analyzeResumeImage(
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<{ extractedText: string; summary: ResumeAnalysisSummary }> {
    const prompt = "You are an expert resume parser. Extract all legible text from this resume image and return the structured ATS analysis summary.";

    const response = await this.ai.models.generateContent({
      model: this.modelName,
      contents: [
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: mimeType,
          },
        },
        prompt,
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            extractedText: { type: "STRING" },
            detectedRole: { type: "STRING" },
            skills: { type: "ARRAY", items: { type: "STRING" } },
            yearsExperience: { type: "INTEGER" },
          },
          required: ["extractedText", "detectedRole", "skills", "yearsExperience"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini during resume image analysis.");
    }

    const result = JSON.parse(text);
    return {
      extractedText: result.extractedText || "",
      summary: {
        detectedRole: result.detectedRole || "",
        skills: result.skills || [],
        yearsExperience: result.yearsExperience || 0,
      },
    };
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

    // Clean any accidentally returned markdown wrap
    return text.replace(/^```html\s*/i, "").replace(/```$/i, "").trim();
  }
}
