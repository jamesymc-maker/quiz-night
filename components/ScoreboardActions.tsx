"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function ScoreboardActions({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function playAgain() {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quiz_id: quizId, fresh: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/play/${quizId}`);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not start new session");
      setLoading(false);
    }
  }

  return (
    <Button size="md" onClick={playAgain} disabled={loading}>
      {loading ? "Starting..." : "Play again"}
    </Button>
  );
}
