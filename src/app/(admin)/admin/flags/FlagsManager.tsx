/**
 * FlagsManager Client Component â€” Feature Flags Dashboard Controller
 *
 * Implements:
 * 1. Runtime config toggles.
 * 2. Scope targeting editor (global, category, question, page).
 * 3. Dynamic target selection dropdowns populated with categories and questions.
 *
 * @module app/(admin)/admin/flags/FlagsManager
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Save, X } from "lucide-react";
import { Card, Button, Toggle, Input, Select } from "@/components/ui";

interface FlagItem {
  _id: string;
  key: string;
  enabled: boolean;
  scope: "global" | "category" | "question" | "page";
  targetId?: string | null;
  note?: string;
}

interface TargetOption {
  id: string;
  name: string;
}

interface FlagsManagerProps {
  initialFlags: FlagItem[];
  categories: TargetOption[];
  questions: TargetOption[];
}

export function FlagsManager({ initialFlags, categories, questions }: FlagsManagerProps) {
  const router = useRouter();
  const [flags, setFlags] = useState<FlagItem[]>(initialFlags);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Edit form state
  const [editScope, setEditScope] = useState<FlagItem["scope"]>("global");
  const [editTargetId, setEditTargetId] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");

  const startEdit = (flag: FlagItem) => {
    setEditingId(flag._id);
    setEditScope(flag.scope);
    setEditTargetId(flag.targetId || "");
    setEditNote(flag.note || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleToggle = async (id: string, currentVal: boolean) => {
    setIsLoading(id);
    const newVal = !currentVal;
    try {
      const res = await fetch(`/api/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newVal }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to toggle feature flag.");
      } else {
        setFlags((prev) =>
          prev.map((f) => (f._id === id ? { ...f, enabled: newVal } : f))
        );
        router.refresh();
      }
    } catch {
      alert("A network error occurred.");
    } finally {
      setIsLoading(null);
    }
  };

  const saveEdit = async (id: string) => {
    setIsLoading(id);
    try {
      const updatePayload: Partial<FlagItem> = {
        scope: editScope,
        note: editNote,
        targetId: ["category", "question"].includes(editScope) && editTargetId ? editTargetId : null,
      };

      const res = await fetch(`/api/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to update feature flag rules.");
      } else {
        setFlags((prev) =>
          prev.map((f) =>
            f._id === id
              ? {
                  ...f,
                  scope: editScope,
                  note: editNote,
                  targetId: updatePayload.targetId,
                }
              : f
          )
        );
        setEditingId(null);
        router.refresh();
      }
    } catch {
      alert("A network error occurred while saving.");
    } finally {
      setIsLoading(null);
    }
  };

  // Resolve target name for display
  const getTargetName = (scope: string, targetId?: string | null) => {
    if (!targetId) return "-";
    if (scope === "category") {
      return categories.find((c) => c.id === targetId)?.name || `Category ID: ${targetId}`;
    }
    if (scope === "question") {
      return questions.find((q) => q.id === targetId)?.name || `Question ID: ${targetId}`;
    }
    return targetId;
  };

  return (
    <div className="space-y-6">
      <Card decoration="none" className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4 w-1/4">Config Key</th>
                <th className="p-4 w-28 text-center">Status</th>
                <th className="p-4 w-36">Scope Details</th>
                <th className="p-4">Notes / Target Description</th>
                <th className="p-4 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {flags.map((flag) => {
                const isEditing = editingId === flag._id;
                const isProcessing = isLoading === flag._id;

                return (
                  <tr
                    key={flag._id}
                    className={`transition-colors ${
                      isEditing ? "bg-[var(--color-post-it)]/25" : "hover:bg-[var(--color-bg-alt)]/50"
                    }`}
                  >
                    {/* Key */}
                    <td className="p-4 align-top">
                      <span className="font-bold text-[var(--color-fg)] font-mono text-sm block mt-1">
                        {flag.key}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="p-4 text-center align-top">
                      <div className="flex justify-center mt-1">
                        <Toggle
                          checked={flag.enabled}
                          onChange={() => handleToggle(flag._id, flag.enabled)}
                          disabled={isProcessing}
                        />
                      </div>
                    </td>

                    {/* Scope Config */}
                    <td className="p-4 align-top">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Select
                            value={editScope}
                            onChange={(e) => {
                              setEditScope(e.target.value as FlagItem["scope"]);
                              setEditTargetId("");
                            }}
                            options={[
                              { value: "global", label: "Global" },
                              { value: "category", label: "Category" },
                              { value: "question", label: "Question" },
                              { value: "page", label: "Page" },
                            ]}
                          />

                          {editScope === "category" && (
                            <Select
                              value={editTargetId}
                              onChange={(e) => setEditTargetId(e.target.value)}
                              options={[
                                { value: "", label: "-- Select Category --" },
                                ...categories.map((c) => ({ value: c.id, label: c.name })),
                              ]}
                            />
                          )}

                          {editScope === "question" && (
                            <Select
                              value={editTargetId}
                              onChange={(e) => setEditTargetId(e.target.value)}
                              options={[
                                { value: "", label: "-- Select Question --" },
                                ...questions.map((q) => ({ value: q.id, label: q.name })),
                              ]}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-[var(--color-bg-alt)] text-[var(--color-fg-muted)] wobbly-sm border border-[var(--color-border-light)]">
                            {flag.scope}
                          </span>
                          {["category", "question"].includes(flag.scope) && flag.targetId && (
                            <p className="text-xs text-[var(--color-accent)] font-bold truncate max-w-[140px]">
                              {getTargetName(flag.scope, flag.targetId)}
                            </p>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="p-4 align-top text-sm">
                      {isEditing ? (
                        <Input
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          placeholder="Purpose of this flag / notes"
                          maxLength={250}
                        />
                      ) : (
                        <p className="text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] leading-relaxed mt-1">
                          {flag.note || "No description provided."}
                        </p>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4 text-center align-top">
                      {isEditing ? (
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="primary"
                            onClick={() => saveEdit(flag._id)}
                            disabled={isProcessing}
                            className="p-2 min-h-0 h-auto w-auto"
                            title="Save"
                          >
                            <Save size={16} />
                          </Button>
                          <Button
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={isProcessing}
                            className="p-2 min-h-0 h-auto w-auto"
                            title="Cancel"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => startEdit(flag)}
                          disabled={isProcessing}
                          className="p-2 min-h-0 h-auto w-auto"
                          title="Edit Config"
                        >
                          <Edit2 size={16} />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
