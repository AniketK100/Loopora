/**
 * Candidate Profile Page — User Personalization Hub
 *
 * Tabbed Client Interface displaying:
 * 1. Overview (Name update, Auth credentials summary)
 * 2. Favorites (📌 bookmarked questions list)
 * 3. Practiced (Questions completed history)
 * 4. Account Settings (Password changes, DPDP data export & deletion)
 *
 * @route /profile
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Card, Input, Button, Badge, Accordion } from "@/components/ui";
import { QuestionListItem, User } from "@/types";
import { trackEvent } from "@/lib/analytics";

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "favorites" | "practiced" | "account">("overview");
  const [profileName, setProfileName] = useState("");
  const [nameUpdating, setNameUpdating] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");

  // Password Update Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passUpdating, setPassUpdating] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // Favorites & Practiced lists state
  const [favorites, setFavorites] = useState<QuestionListItem[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [practiced, setPracticed] = useState<QuestionListItem[]>([]);
  const [pracLoading, setPracLoading] = useState(false);

  // Deletion Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Define fetchList first so it's declared before being used in useEffect
  const fetchList = async (
    url: string,
    setList: React.Dispatch<React.SetStateAction<QuestionListItem[]>>,
    setLoad: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setLoad(true);
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setList(json.data);
      }
    } catch (err) {
      console.error(`[Profile] Failed to fetch list from ${url}:`, err);
    } finally {
      setLoad(false);
    }
  };

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  const [dbUser, setDbUser] = useState<User | null>(null);
  const [dbUserLoading, setDbUserLoading] = useState(false);

  // Sync profile details and fetch complete user record from database
  useEffect(() => {
    async function loadDbUser() {
      if (session) {
        setDbUserLoading(true);
        try {
          const res = await fetch("/api/profile");
          const json = await res.json();
          if (json.success && json.data) {
            setDbUser(json.data);
            setProfileName(json.data.name);
          }
        } catch (err) {
          console.error("[Profile] Error loading DB user profile:", err);
        } finally {
          setDbUserLoading(false);
        }
      }
    }
    loadDbUser();
  }, [session]);

  // Load Favorites
  useEffect(() => {
    if (activeTab === "favorites" && session) {
      fetchList("/api/profile/favorites", setFavorites, setFavLoading);
    }
  }, [activeTab, session]);

  // Load Practiced list
  useEffect(() => {
    if (activeTab === "practiced" && session) {
      fetchList("/api/profile/practiced", setPracticed, setPracLoading);
    }
  }, [activeTab, session]);

  // Resume upload state variables
  const [uploadingResume, setUploadingResume] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Categories list and selected folders state variables
  const [allCategories, setAllCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [foldersUpdating, setFoldersUpdating] = useState(false);
  const [foldersSuccess, setFoldersSuccess] = useState("");
  const [foldersError, setFoldersError] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        if (json.success && json.data) {
          setAllCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (dbUser && dbUser.selectedFolders) {
      const dbFolders = dbUser.selectedFolders;
      setTimeout(() => {
        setSelectedFolders((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(dbFolders)) {
            return dbFolders;
          }
          return prev;
        });
      }, 0);
    }
  }, [dbUser]);

  if (status === "loading" || !session || dbUserLoading || !dbUser) {
    return (
      <div className="paper-grain min-h-screen py-12 flex items-center justify-center">
        <div className="text-[var(--color-fg-muted)] font-[family-name:var(--font-heading)] text-xl animate-pulse">
          Opening study journal...
        </div>
      </div>
    );
  }

  const user = dbUser;

  // Handle Profile Name Update
  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSuccess("");
    setNameError("");
    if (!profileName.trim()) {
      setNameError("Name cannot be empty");
      return;
    }

    setNameUpdating(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName }),
      });
      const json = await res.json();

      if (json.success) {
        setNameSuccess("Profile name updated successfully.");
        // Refresh local next-auth session object
        await updateSession({ user: { ...session.user, name: profileName } });
        trackEvent("update_profile_name");
      } else {
        setNameError(json.error || "Failed to update profile name.");
      }
    } catch (err) {
      console.error(err);
      setNameError("Connection error. Please try again.");
    } finally {
      setNameUpdating(false);
    }
  };

  // Handle Password Update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess("");
    setPassError("");

    if (newPassword !== passwordConfirm) {
      setPassError("New passwords do not match.");
      return;
    }

    setPassUpdating(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();

      if (json.success) {
        setPassSuccess("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setPasswordConfirm("");
        trackEvent("change_password");
      } else {
        setPassError(json.error || "Failed to update password.");
      }
    } catch (err) {
      console.error(err);
      setPassError("Connection error. Please try again.");
    } finally {
      setPassUpdating(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "delete my account") {
      alert("Please type the confirmation text exactly.");
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      const json = await res.json();

      if (json.success) {
        trackEvent("delete_account");
        alert("Your account has been deleted. Logging you out...");
        signOut({ callbackUrl: "/" });
      } else {
        alert(json.error || "Failed to delete account. Please contact support.");
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setUploadError("");
    setUploadSuccess("");
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    setUploadSuccess("");
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit.");
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        setUploadError(json.error || "Upload failed. Please try again.");
      } else {
        setUploadSuccess("Resume successfully parsed and validated!");
        trackEvent("upload_resume_success", { filename: file.name });
        
        // Refresh dbUser details
        const refreshRes = await fetch("/api/profile");
        const refreshJson = await refreshRes.json();
        if (refreshJson.success && refreshJson.data) {
          setDbUser(refreshJson.data);
          if (refreshJson.data.selectedFolders) {
            setSelectedFolders(refreshJson.data.selectedFolders);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setUploadError("Network connection error. Please try again.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleFolderCheckboxChange = (categoryId: string) => {
    setFoldersSuccess("");
    setFoldersError("");
    setSelectedFolders((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        if (prev.length >= 2) {
          setFoldersError("You can select at most 2 folders for resume personalization.");
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  };

  const handleSaveFolders = async () => {
    setFoldersSuccess("");
    setFoldersError("");
    setFoldersUpdating(true);

    try {
      const res = await fetch("/api/profile/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderIds: selectedFolders }),
      });

      const json = await res.json();

      if (!res.ok) {
        setFoldersError(json.error || "Failed to update folder selection.");
      } else {
        setFoldersSuccess("Personalization folders saved successfully!");
        trackEvent("save_personalization_folders", { count: selectedFolders.length });
        
        setDbUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            selectedFolders: selectedFolders,
          };
        });
      }
    } catch (err) {
      console.error(err);
      setFoldersError("Network connection error. Please try again.");
    } finally {
      setFoldersUpdating(false);
    }
  };
  const tabs = [
    { id: "overview", label: "👤 Journal Info" },
    { id: "favorites", label: "📌 Pinboard" },
    { id: "practiced", label: "✅ Solved" },
    { id: "account", label: "⚙️ Settings" },
  ] as const;

  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-4xl font-bold text-[var(--color-fg)]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              📖 My Study Journal
            </h1>
            <p className="text-base text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              Track your bookmarked solutions, completed practice logs, and manage account details.
            </p>
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-[var(--color-secondary)] text-[var(--color-bg)] wobbly-sm border-2 border-[var(--color-border)] font-bold font-[family-name:var(--font-heading)] text-sm">
              Role: {user.role}
            </span>
          </div>
        </div>

        {/* Tab Binder Dividers */}
        <div className="flex border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)]/30 p-1 wobbly-sm gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                trackEvent("switch_profile_tab", { tab: tab.id });
              }}
              className={[
                "flex-1 py-2 text-sm font-bold font-[family-name:var(--font-heading)] transition-all text-center",
                activeTab === tab.id
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)] wobbly-sm border-2 border-[var(--color-border)] -mb-1 relative z-10"
                  : "text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)] border-2 border-transparent",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <Card decoration="tape" className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-4 text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                  Account Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-[family-name:var(--font-body)] text-base">
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--color-fg-muted)]">Register Name</p>
                    <p className="font-bold text-[var(--color-fg)] text-lg">{user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--color-fg-muted)]">Email Address</p>
                    <p className="font-bold text-[var(--color-fg)] text-lg">{user.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--color-fg-muted)]">Sign In Provider</p>
                    <p className="capitalize font-bold text-[var(--color-fg)] text-lg">🔑 {user.authProvider}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[var(--color-fg-muted)]">Subscription Level</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user.isPremium ? "success" : "default"}>
                        {user.isPremium ? "Premium Access Activated" : "Free Candidate Plan"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Resume Personalization Widget */}
              <Card className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-2 text-[var(--color-fg)] flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                  <span>📄</span>
                  <span>AI Resume Personalization</span>
                </h3>
                <p className="text-sm text-[var(--color-fg-muted)] mb-6 font-[family-name:var(--font-body)]">
                  Upload your resume to unlock customized interview answers tailored to your unique background, project history, and experience.
                </p>

                {/* Display Current Resume Status */}
                {user.latestResume ? (
                  <div className="bg-[#faf8f5] border-2 border-[var(--color-border)] wobbly-sm p-4 mb-6 space-y-3 font-[family-name:var(--font-body)]">
                    <div className="flex flex-wrap justify-between items-center border-b-2 border-dashed border-[var(--color-border-light)] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📁</span>
                        <span className="font-bold text-[var(--color-fg)] break-all">{user.latestResume.originalFilename}</span>
                      </div>
                      <Badge variant="success">Validated</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-[var(--color-fg-muted)]">
                      <div>Format: {user.latestResume.mimeTypeSniffed.split("/").pop()?.toUpperCase()}</div>
                      <div>Length: {user.latestResume.pageCount} page(s)</div>
                      <div>Uploaded: {new Date(user.latestResume.createdAt).toLocaleDateString()}</div>
                    </div>

                    {user.resumeAnalysis && (
                      <div className="bg-[var(--color-bg-alt)]/25 p-3 rounded border border-[var(--color-border-light)] text-sm space-y-2 mt-2">
                        <div className="font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">Parsed Profile Highlights:</div>
                        <div className="text-[var(--color-fg-muted)]"><span className="font-bold text-neutral-700">Target Role:</span> {user.resumeAnalysis.detectedRole}</div>
                        <div className="text-[var(--color-fg-muted)]"><span className="font-bold text-neutral-700">Experience:</span> {user.resumeAnalysis.yearsExperience} Year(s)</div>
                        <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                          <span className="text-xs font-bold text-neutral-700">Skills:</span>
                          {user.resumeAnalysis.skills.slice(0, 8).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-xs font-mono text-[var(--color-fg)]">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border-2 border-dashed border-[var(--color-warning)] p-4 wobbly-sm text-sm text-[var(--color-fg)] mb-6 text-center">
                    No resume uploaded yet. Drag and drop your file below to personalize your prep!
                  </div>
                )}

                {/* Dropzone Widget */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleFileDrop}
                  className={[
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 wobbly-sm relative bg-[var(--color-bg)]",
                    dragOver
                      ? "border-[var(--color-accent)] bg-[var(--color-bg-alt)]/30"
                      : "border-[var(--color-border-light)] hover:bg-[var(--color-bg-alt)]/10"
                  ].join(" ")}
                >
                  <input
                    type="file"
                    id="resume-file-input"
                    accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    disabled={uploadingResume}
                  />
                  <div className="space-y-2 pointer-events-none flex flex-col items-center">
                    <span className="text-4xl">📥</span>
                    <p className="font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
                      {uploadingResume ? "Analyzing file..." : "Drag & Drop your resume here, or click to browse"}
                    </p>
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      Accepted: PDF, DOCX, PNG, JPG, JPEG, WEBP (Max 5MB, up to 8 pages)
                    </p>
                  </div>
                </div>

                {uploadError && <p className="text-sm text-[var(--color-accent)] font-bold mt-3">⚠️ {uploadError}</p>}
                {uploadSuccess && <p className="text-sm text-[var(--color-success)] font-bold mt-3">✓ {uploadSuccess}</p>}

                {/* Folder Selection Checkboxes */}
                {user.latestResume && allCategories.length > 0 && (
                  <div className="mt-8 border-t-2 border-dashed border-[var(--color-border-light)] pt-6 space-y-4">
                    <h4 className="text-lg font-bold text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
                      Personalize specific Interview Folders
                    </h4>
                    <p className="text-xs text-[var(--color-fg-muted)]">
                      Select up to 2 categories/folders to personalize with your uploaded resume content.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      {allCategories.map((cat) => {
                        const isChecked = selectedFolders.includes(cat._id);
                        return (
                          <label
                            key={cat._id}
                            className={[
                              "flex items-center gap-3 p-3 border-2 wobbly-sm cursor-pointer select-none transition-all",
                              isChecked
                                ? "bg-[var(--color-bg-alt)] border-[var(--color-border)] shadow-sm"
                                : "bg-[var(--color-bg)] border-[var(--color-border-light)] hover:bg-[var(--color-bg-alt)]/10"
                            ].join(" ")}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isChecked && selectedFolders.length >= 2}
                              onChange={() => handleFolderCheckboxChange(cat._id)}
                              className="accent-[var(--color-accent)] w-4 h-4 cursor-pointer"
                            />
                            <div className="flex flex-col text-left">
                              <span className="font-bold text-sm text-[var(--color-fg)] font-[family-name:var(--font-heading)]">
                                {cat.name}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {foldersError && <p className="text-sm text-[var(--color-accent)] font-bold">⚠️ {foldersError}</p>}
                    {foldersSuccess && <p className="text-sm text-[var(--color-success)] font-bold">✓ {foldersSuccess}</p>}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-[var(--color-fg-muted)] font-mono">
                        {selectedFolders.length} of 2 folders selected
                      </span>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleSaveFolders}
                        disabled={foldersUpdating}
                        className="font-[family-name:var(--font-heading)] font-bold text-sm"
                      >
                        {foldersUpdating ? "Saving..." : "Save Folders Selection"}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Name Editor Card */}
              <Card className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-4 text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                  Update Profile Details
                </h3>
                <form onSubmit={handleNameUpdate} className="space-y-4">
                  <Input
                    label="Display Name"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  {nameError && <p className="text-sm text-[var(--color-accent)] font-bold">{nameError}</p>}
                  {nameSuccess && <p className="text-sm text-[var(--color-success)] font-bold">{nameSuccess}</p>}
                  <Button type="submit" variant="primary" disabled={nameUpdating}>
                    {nameUpdating ? "Saving changes..." : "Save Changes"}
                  </Button>
                </form>
              </Card>
            </div>
          )}

          {/* FAVORITES (PINBOARD) TAB */}
          {activeTab === "favorites" && (
            <div className="space-y-6">
              {favLoading && favorites.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-6 animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border-light)] wobbly-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                  Your pinboard is empty. Click the pushpin icon (📌) on library questions to save them here!
                </div>
              ) : (
                <Accordion
                  items={favorites.map((q) => {
                    const badgeVariant = `difficulty-${q.difficulty}` as
                      | "difficulty-easy"
                      | "difficulty-medium"
                      | "difficulty-hard";

                    return {
                      id: q._id,
                      trigger: (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 text-left gap-2 sm:gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-wider font-mono">
                              📁 {q.categoryName}
                            </span>
                            <span className="font-bold font-[family-name:var(--font-heading)] text-lg text-[var(--color-fg)]">
                              {q.question}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {q.isPremium && (
                              <span className="inline-block px-1.5 py-0.5 text-xs bg-amber-50 text-[var(--color-warning)] border border-[var(--color-warning)] wobbly-sm font-bold">
                                🔒 Premium
                              </span>
                            )}
                            <Badge variant={badgeVariant}>{q.difficulty}</Badge>
                          </div>
                        </div>
                      ),
                      content: (
                        <div className="space-y-4 pt-2">
                          <p className="text-base text-[var(--color-fg-muted)] leading-relaxed italic bg-[var(--color-bg-alt)]/30 p-4 border border-dashed border-[var(--color-border-light)] wobbly-sm font-[family-name:var(--font-body)]">
                            &ldquo;{q.answer.short || "No preview summary available."}&rdquo;
                          </p>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-[var(--color-fg-muted)] font-mono font-[family-name:var(--font-body)]">
                              Tags: {q.tags.join(", ") || "none"}
                            </span>
                            <Link href={`/interview/${q.categorySlug}/${q.slug}`}>
                              <Button variant="primary" size="sm" className="font-[family-name:var(--font-heading)] font-bold text-xs">
                                Open Solution &rarr;
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ),
                    };
                  })}
                />
              )}
            </div>
          )}

          {/* PRACTICED (SOLVED) TAB */}
          {activeTab === "practiced" && (
            <div className="space-y-6">
              {pracLoading && practiced.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-6 animate-pulse space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : practiced.length === 0 ? (
                <div className="text-center py-12 bg-[var(--color-bg)] border-2 border-dashed border-[var(--color-border-light)] wobbly-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                  No questions marked as practiced yet. Keep working through solutions to build your history log!
                </div>
              ) : (
                <Accordion
                  items={practiced.map((q) => {
                    const badgeVariant = `difficulty-${q.difficulty}` as
                      | "difficulty-easy"
                      | "difficulty-medium"
                      | "difficulty-hard";

                    return {
                      id: q._id,
                      trigger: (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 text-left gap-2 sm:gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-wider font-mono">
                              📁 {q.categoryName}
                            </span>
                            <span className="font-bold font-[family-name:var(--font-heading)] text-lg text-[var(--color-fg)]">
                              {q.question}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {q.isPremium && (
                              <span className="inline-block px-1.5 py-0.5 text-xs bg-amber-50 text-[var(--color-warning)] border border-[var(--color-warning)] wobbly-sm font-bold">
                                🔒 Premium
                              </span>
                            )}
                            <Badge variant={badgeVariant}>{q.difficulty}</Badge>
                          </div>
                        </div>
                      ),
                      content: (
                        <div className="space-y-4 pt-2">
                          <p className="text-base text-[var(--color-fg-muted)] leading-relaxed italic bg-[var(--color-bg-alt)]/30 p-4 border border-dashed border-[var(--color-border-light)] wobbly-sm font-[family-name:var(--font-body)]">
                            &ldquo;{q.answer.short || "No preview summary available."}&rdquo;
                          </p>
                          <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-[var(--color-fg-muted)] font-mono font-[family-name:var(--font-body)]">
                              Tags: {q.tags.join(", ") || "none"}
                            </span>
                            <Link href={`/interview/${q.categorySlug}/${q.slug}`}>
                              <Button variant="primary" size="sm" className="font-[family-name:var(--font-heading)] font-bold text-xs">
                                Open Solution &rarr;
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ),
                    };
                  })}
                />
              )}
            </div>
          )}

          {/* SETTINGS & COMPLIANCE TAB */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Password update form (credentials only) */}
              {user.authProvider === "credentials" && (
                <Card className="p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-4 text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                    Update Password
                  </h3>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                    />
                    {passError && <p className="text-sm text-[var(--color-accent)] font-bold">{passError}</p>}
                    {passSuccess && <p className="text-sm text-[var(--color-success)] font-bold">{passSuccess}</p>}
                    <Button type="submit" variant="primary" disabled={passUpdating}>
                      {passUpdating ? "Updating password..." : "Update Password"}
                    </Button>
                  </form>
                </Card>
              )}

              {/* Data Compliance Card (DPDP access, portability & erasure rights) */}
              <Card decoration="tape" className="p-6 md:p-8" style={{ borderLeftWidth: "6px", borderLeftColor: "var(--color-warning)" }}>
                <h3 className="text-xl font-bold mb-2 text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                  Personal Data & Privacy Settings
                </h3>
                <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] mb-6">
                  Loopora complies with privacy guidelines including India&apos;s Digital Personal Data Protection Act (DPDP Act).
                  You have full rights to access, port, and delete all personal information cached in our notebooks.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Portability: Export Data */}
                  <a href="/api/profile/export" download className="inline-block flex-1">
                    <Button variant="outline" className="w-full text-center font-[family-name:var(--font-heading)] font-bold text-base py-3">
                      📥 Export My Personal Data
                    </Button>
                  </a>

                  {/* Erasure: Delete Account Trigger */}
                  <Button
                    onClick={() => {
                      setShowDeleteModal(true);
                      trackEvent("trigger_delete_account_modal");
                    }}
                    variant="primary"
                    className="flex-1 font-[family-name:var(--font-heading)] font-bold text-base py-3 bg-[var(--color-accent)] border-[var(--color-border)]"
                  >
                    ⚠️ Permanently Delete Account
                  </Button>
                </div>
              </Card>

              {/* Erasure Warning Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                  <Card className="max-w-md w-full p-6 md:p-8 space-y-4 animate-in fade-in zoom-in duration-200">
                    <h4 className="text-2xl font-bold text-[var(--color-accent)]" style={{ fontFamily: "var(--font-heading)" }}>
                      Are you absolutely sure?
                    </h4>
                    <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] leading-relaxed">
                      This action will cascade and permanently erase your account details, premium subscription status,
                      favorites pinboard, and practice history logs from our servers. This cannot be undone.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[var(--color-fg)] uppercase">
                        Type <span className="text-[var(--color-accent)]">&ldquo;delete my account&rdquo;</span> to confirm:
                      </p>
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="delete my account"
                        className="text-center"
                      />
                    </div>
                    <div className="flex gap-4 pt-2">
                      <Button
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeleteConfirmText("");
                        }}
                        variant="outline"
                        className="flex-1 text-sm py-2.5"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleDeleteAccount}
                        variant="primary"
                        disabled={deleteLoading || deleteConfirmText.toLowerCase() !== "delete my account"}
                        className="flex-1 text-sm py-2.5 bg-[var(--color-accent)]"
                      >
                        {deleteLoading ? "Erasing data..." : "Delete Account"}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
