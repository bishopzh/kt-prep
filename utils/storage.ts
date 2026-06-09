import type { AppData, Flashcard, FlashcardProgress } from "@/types";
import { createDefaultSRS } from "./srs";

const STORAGE_KEY = "kt-prep-data";
const PROGRESS_PREFIX = "kt-prep-progress-";

const defaultData: AppData = {
  decks: [],
  quizHistory: [],
  settings: { theme: "light" },
};

function normalizeCard(card: Flashcard, order: number): Flashcard {
  return {
    id: card.id,
    question: card.question ?? "",
    answer: card.answer ?? "",
    order: card.order ?? order,
    studied: card.studied ?? false,
    srs: card.srs?.nextReviewDate ? card.srs : createDefaultSRS(),
  };
}

export function loadAppData(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as AppData;
    return {
      decks: (parsed.decks ?? []).map((deck) => ({
        ...deck,
        cards: (deck.cards ?? []).map((card, i) => normalizeCard(card, i)),
      })),
      quizHistory: parsed.quizHistory ?? [],
      settings: parsed.settings ?? { theme: "light" },
    };
  } catch {
    return defaultData;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadFlashcardProgress(deckId: string): FlashcardProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PROGRESS_PREFIX}${deckId}`);
    if (!raw) return null;
    return JSON.parse(raw) as FlashcardProgress;
  } catch {
    return null;
  }
}

export function saveFlashcardProgress(progress: FlashcardProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${PROGRESS_PREFIX}${progress.deckId}`,
    JSON.stringify(progress)
  );
}
