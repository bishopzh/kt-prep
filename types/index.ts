export interface SRSData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
  studied: boolean;
  srs: SRSData;
}

export interface Deck {
  id: string;
  name: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  cards: Flashcard[];
}

export interface QuizAttempt {
  id: string;
  deckId: string;
  deckName: string;
  date: string;
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
  grade: Grade;
}

export type Grade = "A" | "B" | "C" | "D";

export type SRSRating = "again" | "hard" | "good" | "easy";

export type Theme = "light" | "dark";

export interface AppSettings {
  theme: Theme;
}

export interface AppData {
  decks: Deck[];
  quizHistory: QuizAttempt[];
  settings: AppSettings;
}

export interface QuizQuestion {
  cardId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface FlashcardProgress {
  deckId: string;
  currentIndex: number;
  shuffled: boolean;
  shuffledOrder: string[];
}
