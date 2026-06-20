"use client";

import { useEffect, useState } from "react";

const COLOURS = ["#FFC043", "#FF5C7A", "#33D6A6", "#3FC8E4", "#F6F2E9"];

interface ConfettiPiece {
  id: number;
  left: number;
  colour: string;
  delay: number;
  duration: number;
  size: number;
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const generated: ConfettiPiece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
      size: 6 + Math.random() * 8,
    }));
    setPieces(generated);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.colour,
            animation: `confetti-fall ${piece.duration}s ${piece.delay}s ease-in forwards`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
