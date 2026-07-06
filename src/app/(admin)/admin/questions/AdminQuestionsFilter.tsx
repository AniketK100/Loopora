/**
 * AdminQuestionsFilter Client Component
 *
 * Provides a client filter header containing full-text search fields
 * and category filter selectors, updating routing queries dynamically.
 *
 * @module app/(admin)/admin/questions/AdminQuestionsFilter
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Button } from "@/components/ui";

interface AdminQuestionsFilterProps {
  categories: { id: string; name: string }[];
  currentSearch: string;
  currentCategory: string;
}

export function AdminQuestionsFilter({
  categories,
  currentSearch,
  currentCategory,
}: AdminQuestionsFilterProps) {
  const router = useRouter();

  const [q, setQ] = useState(currentSearch);
  const [category, setCategory] = useState(currentCategory);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    params.set("page", "1"); // Reset pagination

    router.push(`/admin/questions?${params.toString()}`);
  };

  const handleClear = () => {
    setQ("");
    setCategory("");
    router.push("/admin/questions");
  };

  const selectOptions = [
    { value: "", label: "All Folders / Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <form
      onSubmit={handleApply}
      className="flex flex-col md:flex-row gap-4 items-end bg-[var(--color-bg)] border-2 border-[var(--color-border)] wobbly-sm p-4"
    >
      <div className="w-full md:flex-1">
        <Input
          label="Search Questions"
          placeholder="e.g. tell me about yourself..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="w-full md:w-64">
        <Select
          label="Filter Folder"
          options={selectOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          className="w-full md:w-auto font-[family-name:var(--font-heading)] font-bold text-sm"
        >
          Clear
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="w-full md:w-auto font-[family-name:var(--font-heading)] font-bold text-sm"
        >
          Filter
        </Button>
      </div>
    </form>
  );
}
