import { AnswerTile } from "./AnswerTile";
import { ProgressDots } from "./ProgressDots";
import { Button } from "./ui/Button";

interface QuestionCardProps {
  questionText: string;
  options: string[];
  correctIndex: number;
  questionNumber: number;
  totalQuestions: number;
  revealed?: boolean;
  explanation?: string | null;
  onReveal?: () => void;
  accent?: "gold" | "cyan";
  showRevealButton?: boolean;
}

export function QuestionCard({
  questionText,
  options,
  correctIndex,
  questionNumber,
  totalQuestions,
  revealed = false,
  explanation,
  onReveal,
  accent = "gold",
  showRevealButton = true,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-3xl mx-auto animate-spotlight">
      <div className="flex justify-center mb-6">
        <ProgressDots
          total={totalQuestions}
          current={questionNumber}
          accent={accent}
        />
      </div>

      <div className="rounded-3xl bg-surface p-6 md:p-10 card-glow border border-muted/10 mb-6">
        <p className="font-display text-xl md:text-3xl font-semibold text-cream text-center leading-snug">
          {questionText}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
        {options.map((option, i) => (
          <AnswerTile
            key={i}
            label={option}
            index={i}
            revealed={revealed}
            isCorrect={i === correctIndex}
          />
        ))}
      </div>

      {revealed && explanation && (
        <div className="rounded-xl bg-studio/60 border border-muted/20 p-4 mb-6">
          <p className="text-muted text-sm md:text-base">{explanation}</p>
        </div>
      )}

      {showRevealButton && !revealed && onReveal && (
        <div className="flex justify-center">
          <Button size="lg" onClick={onReveal}>
            Reveal answer
          </Button>
        </div>
      )}
    </div>
  );
}
