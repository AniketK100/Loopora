/**
 * useResumeUpload Hook
 *
 * Shared resume upload logic with progress states, limit awareness,
 * and classification feedback. Supports multi-resume management.
 *
 * @module hooks/useResumeUpload
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

interface ResumeMetadata {
  _id: string;
  displayName: string;
  originalFilename: string;
  pageCount: number;
  status: "pending" | "clean" | "rejected";
  isActive: boolean;
  classificationScore: number;
  isClassifiedAsResume: boolean;
  qualityScore: number;
  missingSections: string[];
  suggestions: string[];
  createdAt: string;
}

interface ResumeAnalysis {
  detectedRole: string;
  skills: string[];
  yearsExperience: number;
}

interface UploadResult {
  success: boolean;
  resumeId?: string;
  contentHash?: string;
  error?: string;
  errorType?: string;
  cached?: boolean;
  classification?: {
    isResume: boolean;
    confidence: number;
    label: string;
  };
  quality?: {
    score: number;
    missingSections: string[];
    suggestions: string[];
  };
}

interface ResumeListResponse {
  success: boolean;
  resumes: ResumeMetadata[];
  maxResumes: number;
  currentCount: number;
  isPremium: boolean;
}

export type UploadStage =
  | "idle"
  | "validating"
  | "parsing"
  | "security_scan"
  | "classification"
  | "quality_analysis"
  | "saving"
  | "complete"
  | "error";

interface UseResumeUploadReturn {
  resumes: ResumeMetadata[];
  latestResume: ResumeMetadata | null;
  resumeAnalysis: ResumeAnalysis | null;
  isUploading: boolean;
  uploadStage: UploadStage;
  uploadStageLabel: string;
  uploadError: string | null;
  uploadErrorType: string | null;
  uploadSuccess: string | null;
  maxResumes: number;
  isPremium: boolean;
  canUpload: boolean;
  uploadResume: (_file: File) => Promise<UploadResult>;
  setActiveResume: (_resumeId: string) => Promise<boolean>;
  deleteResume: (_resumeId: string) => Promise<boolean>;
  renameResume: (_resumeId: string, _displayName: string) => Promise<boolean>;
  refreshResumes: () => Promise<void>;
  clearMessages: () => void;
}

const STAGE_LABELS: Record<UploadStage, string> = {
  idle: "",
  validating: "Validating file...",
  parsing: "Extracting text from PDF...",
  security_scan: "Running security scan...",
  classification: "Classifying document...",
  quality_analysis: "Analyzing resume quality...",
  saving: "Saving resume...",
  complete: "Upload complete!",
  error: "Upload failed",
};

export function useResumeUpload(): UseResumeUploadReturn {
  const [resumes, setResumes] = useState<ResumeMetadata[]>([]);
  const [latestResume, setLatestResume] = useState<ResumeMetadata | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<UploadStage>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrorType, setUploadErrorType] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [maxResumes, setMaxResumes] = useState(1);
  const [isPremium, setIsPremium] = useState(false);

  const refreshResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resume/list");
      const json: ResumeListResponse = await res.json();
      if (json.success) {
        setResumes(json.resumes);
        setMaxResumes(json.maxResumes);
        setIsPremium(json.isPremium);

        const active = json.resumes.find((r) => r.isActive) || json.resumes[0] || null;
        setLatestResume(active);
      }
    } catch (err) {
      console.error("[useResumeUpload] Failed to refresh resumes:", err);
    }

    // Also fetch analysis for the active resume
    try {
      const profileRes = await fetch("/api/profile");
      const profileJson = await profileRes.json();
      if (profileJson.success && profileJson.data) {
        setResumeAnalysis(profileJson.data.resumeAnalysis || null);
      }
    } catch (err) {
      console.error("[useResumeUpload] Failed to fetch profile:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    refreshResumes();
  }, [refreshResumes]);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      return "Only PDF files are accepted. Please upload a PDF resume.";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "File size exceeds 5MB limit. Please upload a smaller PDF.";
    }
    if (file.type !== "application/pdf" && file.type !== "") {
      return "Invalid file type. Only PDF files are accepted.";
    }
    return null;
  };

  const uploadResume = useCallback(async (file: File): Promise<UploadResult> => {
    setUploadError(null);
    setUploadErrorType(null);
    setUploadSuccess(null);

    // Client-side validation
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      setUploadErrorType("validation_failed");
      setUploadStage("error");
      return { success: false, error: validationError, errorType: "validation_failed" };
    }

    setIsUploading(true);
    setUploadStage("validating");

    try {
      // Simulate progress stages
      const stageTimer1 = setTimeout(() => setUploadStage("parsing"), 500);
      const stageTimer2 = setTimeout(() => setUploadStage("security_scan"), 1500);
      const stageTimer3 = setTimeout(() => setUploadStage("classification"), 3000);
      const stageTimer4 = setTimeout(() => setUploadStage("quality_analysis"), 5000);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      // Clear stage timers
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.error || json.message || "Upload failed. Please try again.";
        const errorType = json.error || "upload_failed";
        setUploadError(errorMsg);
        setUploadErrorType(errorType);
        setUploadStage("error");
        return { success: false, error: errorMsg, errorType };
      }

      setUploadStage("complete");
      setUploadSuccess("Resume uploaded and validated successfully!");
      trackEvent("upload_resume_success", { filename: file.name, cached: json.cached });

      await refreshResumes();

      return {
        success: true,
        resumeId: json.resumeId,
        contentHash: json.contentHash,
        cached: json.cached,
        classification: json.classification,
        quality: json.quality,
      };
    } catch (err) {
      console.error("[useResumeUpload] Upload error:", err);
      const errorMsg = "Network error. Please try again.";
      setUploadError(errorMsg);
      setUploadErrorType("network_error");
      setUploadStage("error");
      return { success: false, error: errorMsg, errorType: "network_error" };
    } finally {
      setIsUploading(false);
    }
  }, [refreshResumes]);

  const setActiveResume = useCallback(async (resumeId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/resume/${resumeId}`, { method: "PATCH" });
      const json = await res.json();
      if (json.success) {
        await refreshResumes();
        return true;
      }
      return false;
    } catch (err) {
      console.error("[useResumeUpload] Failed to set active:", err);
      return false;
    }
  }, [refreshResumes]);

  const deleteResume = useCallback(async (resumeId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/resume/${resumeId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        await refreshResumes();
        return true;
      }
      setUploadError(json.error || "Failed to delete resume.");
      return false;
    } catch (err) {
      console.error("[useResumeUpload] Failed to delete:", err);
      return false;
    }
  }, [refreshResumes]);

  const renameResume = useCallback(async (resumeId: string, displayName: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/resume/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", displayName }),
      });
      const json = await res.json();
      if (json.success) {
        await refreshResumes();
        return true;
      }
      setUploadError(json.error || "Failed to rename resume.");
      return false;
    } catch (err) {
      console.error("[useResumeUpload] Failed to rename:", err);
      return false;
    }
  }, [refreshResumes]);

  const clearMessages = useCallback(() => {
    setUploadError(null);
    setUploadErrorType(null);
    setUploadSuccess(null);
    setUploadStage("idle");
  }, []);

  const canUpload = resumes.length < maxResumes;

  return {
    resumes,
    latestResume,
    resumeAnalysis,
    isUploading,
    uploadStage,
    uploadStageLabel: STAGE_LABELS[uploadStage],
    uploadError,
    uploadErrorType,
    uploadSuccess,
    maxResumes,
    isPremium,
    canUpload,
    uploadResume,
    setActiveResume,
    deleteResume,
    renameResume,
    refreshResumes,
    clearMessages,
  };
}
