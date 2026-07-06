/**
 * CategoryForm Client Component — Admin Category Editor
 *
 * Provides a unified creation/editing form with live validation,
 * automatic slug generation, and integration with the Categories API.
 *
 * @module app/(admin)/admin/categories/CategoryForm
 * @see 03_App_Flow.md §5 — Admin Content Flow
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, Toggle, Card } from "@/components/ui";
import { CategoryType } from "@/types";

interface CategoryFormProps {
  initialData?: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    type: CategoryType;
    order: number;
    isPublished: boolean;
  };
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [icon, setIcon] = useState(initialData?.icon || "Code");
  const [type, setType] = useState<CategoryType>(initialData?.type || "technical");
  const [order, setOrder] = useState<number>(initialData?.order || 0);
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      // Auto slugify: lowercase, alphanumeric + hyphens only
      const slugified = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(slugified);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const payload = {
      name,
      slug,
      description,
      icon,
      type,
      order: Number(order),
      isPublished,
    };

    try {
      const url = isEditing
        ? `/api/categories/${initialData._id}`
        : "/api/categories";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save category. Please try again.");
        setIsLoading(false);
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const categoryTypeOptions = [
    { value: "hr", label: "HR / General" },
    { value: "technical", label: "Technical" },
    { value: "non-technical", label: "Non-Technical" },
    { value: "situational", label: "Situational" },
    { value: "managerial", label: "Managerial" },
    { value: "company", label: "Company Specific" },
    { value: "aptitude", label: "Aptitude" },
    { value: "case-study", label: "Case Study" },
  ];

  return (
    <Card decoration="none" className="p-6 md:p-8">
      {error && (
        <div className="wobbly-sm border-2 border-[var(--color-error)] bg-red-50 p-3 mb-6 text-sm text-[var(--color-error)] font-[family-name:var(--font-body)]">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Category Name"
            placeholder="e.g. Human Resources"
            required
            value={name}
            onChange={handleNameChange}
            disabled={isLoading}
          />

          <Input
            label="Slug (lowercase, hyphens)"
            placeholder="e.g. hr"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            disabled={isLoading}
            helperText="Used in URLs: /interview/hr"
          />

          <Select
            label="Category Type"
            options={categoryTypeOptions}
            value={type}
            onChange={(e) => setType(e.target.value as CategoryType)}
            disabled={isLoading}
          />

          <Input
            label="Icon Name (Lucide React)"
            placeholder="e.g. Code, User, Cpu"
            required
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            disabled={isLoading}
            helperText="Common icons: User, Code, Award, Cpu, BookOpen, Brain, Briefcase"
          />

          <Input
            label="Sort Order"
            type="number"
            required
            min="0"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
            disabled={isLoading}
            helperText="Ascending priority: 1 shows before 2"
          />

          <div className="flex items-center pt-8">
            <Toggle
              checked={isPublished}
              onChange={setIsPublished}
              label="Publish Category (makes visible on public pages)"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-fg)]"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Write a brief overview of the questions in this folder..."
            className={[
              "wobbly-sm border-2 px-4 py-2.5",
              "bg-[var(--color-bg)] text-[var(--color-fg)]",
              "font-[family-name:var(--font-body)]",
              "placeholder:text-[var(--color-fg-muted)]",
              "transition-all duration-[var(--transition-fast)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1",
              "border-[var(--color-border)]",
            ].join(" ")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t-2 border-dashed border-[var(--color-border-light)]">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
