"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface HomeActionsProps {
  quizId?: string;
  deleteOnly?: boolean;
}

export function HomeActions({ quizId, deleteOnly = false }: HomeActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createQuiz() {
    setLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "New Quiz" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/build/${data.id}`);
    } catch {
      setLoading(false);
    }
  }

  async function deleteQuiz() {
    if (!quizId) return;
    if (!confirm("Delete this quiz? This cannot be undone.")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (deleteOnly && quizId) {
    return (
      <Button size="sm" variant="danger" onClick={deleteQuiz} disabled={loading}>
        Delete
      </Button>
    );
  }

  return (
    <Button size="lg" onClick={createQuiz} disabled={loading}>
      {loading ? "Creating..." : "New quiz"}
    </Button>
  );
}
