/**
 * useResumeUpload Hook
 *
 * Shared resume upload logic for reuse across components.
 * Handles file validation, upload, and resume status fetching.
 *
 * @module hooks/useResumeUpload
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

interface ResumeMetadata {
  _id: string;
  originalFilename: string;
  mimeTypeSniffed: string;
  pageCount: number;
  contentHash: string;
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
  cached?: boolean;
}

interface UseResumeUploadReturn {
  latestResume: ResumeMetadata | null;
  resumeAnalysis: ResumeAnalysis | null;
  isUploading: boolean;
  uploadError: string | null;
  uploadSuccess: string | null;
  uploadResume: (_file: File) => Promise<UploadResult>;
  refreshResume: () => Promise<void>;
  clearMessages: () => void;
}

export function useResumeUpload(): UseResumeUploadReturn {
  const [latestResume, setLatestResume] = useState<ResumeMetadata | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const refreshResume = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const json = await res.json();
      if (json.success && json.data) {
        setLatestResume(json.data.latestResume || null);
        setResumeAnalysis(json.data.resumeAnalysis || null);
      }
    } catch (err) {
      console.error("[useResumeUpload] Failed to refresh resume:", err);
    }
  }, []);

  useEffect(() => {
    async function loadResume() {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json.success && json.data) {
          setLatestResume(json.data.latestResume || null);
          setResumeAnalysis(json.data.resumeAnalysis || null);
        }
      } catch (err) {
        console.error("[useResumeUpload] Failed to load resume:", err);
      }
    }
    loadResume();
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      return "Only PDF files are accepted. Please upload a PDF resume.";
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return "File size exceeds 5MB limit. Please upload a smaller PDF.";
    }

    // Check MIME type
    if (file.type !== "application/pdf") {
      return "Invalid file type. Only PDF files are accepted.";
    }

    return null;
  };

  const uploadResume = useCallback(async (file: File): Promise<UploadResult> => {
    setUploadError(null);
    setUploadSuccess(null);

    // Client-side validation
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      return { success: false, error: validationError };
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.error || "Upload failed. Please try again.";
        setUploadError(errorMsg);
        return { success: false, error: errorMsg };
      }

      setUploadSuccess("Resume uploaded and validated successfully!");
      trackEvent("upload_resume_success", { filename: file.name });

      // Refresh resume data
      await refreshResume();

      return {
        success: true,
        resumeId: json.resumeId,
        contentHash: json.contentHash,
        cached: json.cached,
      };
    } catch (err) {
      console.error("[useResumeUpload] Upload error:", err);
      const errorMsg = "Network error. Please try again.";
      setUploadError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsUploading(false);
    }
  }, [refreshResume]);

  const clearMessages = useCallback(() => {
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  return {
    latestResume,
    resumeAnalysis,
    isUploading,
    uploadError,
    uploadSuccess,
    uploadResume,
    refreshResume,
    clearMessages,
  };
}
