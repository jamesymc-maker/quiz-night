export type Level = "kids" | "junior" | "adult" | "expert";

export type RoundType = "general" | "specialist";

export type SessionPhase = "round_intro" | "question" | "reveal" | "scoring";

export type SessionStatus = "in_progress" | "finished";

export interface Quiz {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface Player {
  id: string;
  quiz_id: string;
  name: string;
  specialist_topic: string | null;
  level: Level;
  order_index: number;
  created_at: string;
}

export interface Round {
  id: string;
  quiz_id: string;
  order_index: number;
  title: string;
  topic: string;
  level: Level;
  type: RoundType;
  player_id: string | null;
  timer_seconds: number | null;
  created_at: string;
}

export interface Question {
  id: string;
  round_id: string;
  order_index: number;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  points: number;
  created_at: string;
}

export interface SessionState {
  phase: SessionPhase;
  currentRoundIndex: number;
  currentQuestionIndex: number;
  revealed: boolean;
  scores: Record<string, number>;
}

export interface Session {
  id: string;
  quiz_id: string;
  state: SessionState;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizWithMeta extends Quiz {
  round_count: number;
}

export interface RoundWithQuestions extends Round {
  questions: Question[];
}

export interface QuizFull extends Quiz {
  players: Player[];
  rounds: RoundWithQuestions[];
}
