import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-studio hover:bg-gold/90 focus-visible:ring-gold font-semibold",
  secondary:
    "bg-surface text-cream border border-muted/30 hover:bg-surface/80 focus-visible:ring-muted",
  danger:
    "bg-coral/20 text-coral border border-coral/40 hover:bg-coral/30 focus-visible:ring-coral",
  ghost:
    "text-muted hover:text-cream hover:bg-surface/50 focus-visible:ring-muted",
};

const sizes: Record<"sm" | "md" | "lg", string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-2xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-studio disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
