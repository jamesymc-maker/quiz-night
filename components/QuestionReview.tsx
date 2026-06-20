"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Question } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"];

interface QuestionReviewProps {
  questions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void;
}

export function QuestionReview({
  questions: initialQuestions,
  onQuestionsUpdated,
}: QuestionReviewProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  function updateLocal(updated: Question) {
    const next = questions.map((q) => (q.id === updated.id ? updated : q));
    setQuestions(next);
    onQuestionsUpdated(next);
  }

  async function saveQuestion(q: Question) {
    const res = await fetch(`/api/questions/${q.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: q.question_text,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
      }),
    });
    const data = await res.json();
    if (res.ok) updateLocal(data);
  }

  async function deleteQuestion(id: string) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    const next = questions.filter((q) => q.id !== id);
    setQuestions(next);
    onQuestionsUpdated(next);
  }

  async function regenerateQuestion(id: string) {
    setRegeneratingId(id);
    try {
      const res = await fetch(`/api/questions/${id}/regenerate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateLocal(data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegeneratingId(null);
    }
  }

  return (
    <div className="space-y-4 mt-4 border-t border-muted/20 pt-4">
      <p className="text-muted text-xs">
        Review each question and check the facts before play. Edit anything that looks wrong.
      </p>
      {questions.map((q, i) => (
        <QuestionEditor
          key={q.id}
          index={i}
          question={q}
          regenerating={regeneratingId === q.id}
          onChange={(updated) => {
            setQuestions((qs) =>
              qs.map((x) => (x.id === updated.id ? updated : x))
            );
          }}
          onSave={(updated) => saveQuestion(updated)}
          onDelete={() => deleteQuestion(q.id)}
          onRegenerate={() => regenerateQuestion(q.id)}
        />
      ))}
    </div>
  );
}

function QuestionEditor({
  index,
  question,
  regenerating,
  onChange,
  onSave,
  onDelete,
  onRegenerate,
}: {
  index: number;
  question: Question;
  regenerating: boolean;
  onChange: (q: Question) => void;
  onSave: (q: Question) => void;
  onDelete: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="rounded-xl bg-studio/60 border border-muted/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-gold text-sm">Q{index + 1}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={regenerating}>
            {regenerating ? "..." : "Regenerate"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      <textarea
        value={question.question_text}
        onChange={(e) =>
          onChange({ ...question, question_text: e.target.value })
        }
        onBlur={() => onSave(question)}
        rows={2}
        className="w-full rounded-lg bg-surface border border-muted/30 px-3 py-2 text-cream text-sm focus:outline-none focus:ring-2 focus:ring-gold resize-none"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {question.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const updated = { ...question, correct_index: oi };
                onChange(updated);
                onSave(updated);
              }}
              className={`shrink-0 w-8 h-8 rounded-lg font-mono text-xs font-bold transition-colors ${
                question.correct_index === oi
                  ? "bg-coral text-cream"
                  : "bg-surface text-muted hover:text-gold"
              }`}
              title="Set as correct answer"
            >
              {LETTERS[oi]}
            </button>
            <input
              value={opt}
              onChange={(e) => {
                const opts = [...question.options];
                opts[oi] = e.target.value;
                onChange({ ...question, options: opts });
              }}
              onBlur={() => onSave(question)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold ${
                question.correct_index === oi
                  ? "bg-coral/10 border-coral/40 text-cream"
                  : "bg-surface border-muted/30 text-cream"
              }`}
            />
          </div>
        ))}
      </div>

      <input
        value={question.explanation ?? ""}
        onChange={(e) =>
          onChange({ ...question, explanation: e.target.value })
        }
        onBlur={() => onSave(question)}
        placeholder="Explanation"
        className="w-full rounded-lg bg-surface border border-muted/30 px-3 py-2 text-muted text-sm focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </div>
  );
}
