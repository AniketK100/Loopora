/**
 * DeleteQuestionButton Client Component — Admin Questions List
 *
 * Client button triggered delete helper with a confirm prompt.
 *
 * @module app/(admin)/admin/questions/DeleteQuestionButton
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

interface DeleteQuestionButtonProps {
  id: string;
  questionText: string;
}

export function DeleteQuestionButton({ id, questionText }: DeleteQuestionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    const abbreviatedText =
      questionText.length > 50 ? `${questionText.substring(0, 50)}...` : questionText;

    const confirmed = window.confirm(
      `Are you sure you want to delete the question: "${abbreviatedText}"?\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/questions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete question.");
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
