import { cn } from "@/lib/utils";

interface AnswerTileProps {
  label: string;
  index: number;
  revealed?: boolean;
  isCorrect?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const LETTERS = ["A", "B", "C", "D"];

export function AnswerTile({
  label,
  index,
  revealed = false,
  isCorrect = false,
  onClick,
  disabled = true,
}: AnswerTileProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={cn(
        "flex items-start gap-3 rounded-2xl p-4 md:p-5 card-glow transition-all min-h-[80px] md:min-h-[100px]",
        revealed && isCorrect
          ? "bg-coral/20 border-2 border-coral animate-answer-reveal"
          : "bg-surface border border-muted/20",
        onClick && !disabled && "cursor-pointer hover:border-gold/40"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold",
          revealed && isCorrect
            ? "bg-coral text-cream"
            : "bg-studio text-gold"
        )}
      >
        {LETTERS[index]}
      </span>
      <span className="text-cream text-base md:text-lg leading-snug pt-0.5">
        {label}
      </span>
    </div>
  );
}
