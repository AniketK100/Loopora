/**
 * DeleteCategoryButton Client Component — Admin Categories List
 *
 * Client button triggered delete helper with a confirm prompt.
 *
 * @module app/(admin)/admin/categories/DeleteCategoryButton
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface DeleteCategoryButtonProps {
  id: string;
  name: string;
}

export function DeleteCategoryButton({ id, name }: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `⚠️ WARNING: Are you sure you want to delete the category "${name}"?\n\n` +
        `This will CASCADINGLY DELETE ALL QUESTIONS associated with this category!\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete category.");
        setIsLoading(false);
        return;
      }

      router.refresh();
    } catch {
      alert("A network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      isLoading={isLoading}
      className="!border-[var(--color-error)] !text-[var(--color-error)] hover:!bg-red-50"
    >
      Delete
    </Button>
  );
}
