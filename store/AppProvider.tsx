"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AppData,
  Deck,
  Flashcard,
  QuizAttempt,
  SRSRating,
  Theme,
} from "@/types";
import { generateId } from "@/utils/id";
import { createDefaultSRS, updateSRS, isDueForReview } from "@/utils/srs";
import { loadAppData, saveAppData } from "@/utils/storage";

interface AppContextValue {
  data: AppData;
  loaded: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  createDeck: (name: string, subject: string) => Deck;
  updateDeck: (id: string, updates: Partial<Pick<Deck, "name" | "subject">>) => void;
  deleteDeck: (id: string) => void;
  getDeck: (id: string) => Deck | undefined;
  addCards: (deckId: string, cards: Omit<Flashcard, "id" | "order" | "studied" | "srs">[]) => void;
  updateCard: (deckId: string, cardId: string, updates: Partial<Pick<Flashcard, "question" | "answer">>) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  reorderCards: (deckId: string, cardIds: string[]) => void;
  markCardStudied: (deckId: string, cardId: string, studied: boolean) => void;
  rateCard: (deckId: string, cardId: string, rating: SRSRating) => void;
  importDeck: (deck: Deck) => void;
  addQuizAttempt: (attempt: Omit<QuizAttempt, "id">) => void;
  getDueCards: (deckId?: string) => { deck: Deck; card: Flashcard }[];
  getAllSubjects: () => string[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>({ decks: [], quizHistory: [], settings: { theme: "light" } });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadAppData();
    setData(stored);
    setLoaded(true);
    document.documentElement.classList.toggle("dark", stored.settings.theme === "dark");
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveAppData(data);
  }, [data, loaded]);

  const setTheme = useCallback((theme: Theme) => {
    setData((prev) => ({ ...prev, settings: { theme } }));
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, []);

  const createDeck = useCallback((name: string, subject: string): Deck => {
    const deck: Deck = {
      id: generateId(),
      name,
      subject,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cards: [],
    };
    setData((prev) => ({ ...prev, decks: [...prev.decks, deck] }));
    return deck;
  }, []);

  const updateDeck = useCallback((id: string, updates: Partial<Pick<Deck, "name" | "subject">>) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      ),
    }));
  }, []);

  const deleteDeck = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.filter((d) => d.id !== id),
      quizHistory: prev.quizHistory.filter((q) => q.deckId !== id),
    }));
  }, []);

  const getDeck = useCallback(
    (id: string) => data.decks.find((d) => d.id === id),
    [data.decks]
  );

  const addCards = useCallback(
    (deckId: string, cards: Omit<Flashcard, "id" | "order" | "studied" | "srs">[]) => {
      setData((prev) => ({
        ...prev,
        decks: prev.decks.map((d) => {
          if (d.id !== deckId) return d;
          const newCards: Flashcard[] = cards.map((c, i) => ({
            id: generateId(),
            question: c.question,
            answer: c.answer,
            order: d.cards.length + i,
            studied: false,
            srs: createDefaultSRS(),
          }));
          return {
            ...d,
            cards: [...d.cards, ...newCards],
            updatedAt: new Date().toISOString(),
          };
        }),
      }));
    },
    []
  );

  const updateCard = useCallback(
    (deckId: string, cardId: string, updates: Partial<Pick<Flashcard, "question" | "answer">>) => {
      setData((prev) => ({
        ...prev,
        decks: prev.decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: d.cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
                updatedAt: new Date().toISOString(),
              }
            : d
        ),
      }));
    },
    []
  );

  const deleteCard = useCallback((deckId: string, cardId: string) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.filter((c) => c.id !== cardId).map((c, i) => ({ ...c, order: i })),
              updatedAt: new Date().toISOString(),
            }
          : d
      ),
    }));
  }, []);

  const reorderCards = useCallback((deckId: string, cardIds: string[]) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.map((d) => {
        if (d.id !== deckId) return d;
        const cardMap = new Map(d.cards.map((c) => [c.id, c]));
        const reordered = cardIds
          .map((id, i) => {
            const card = cardMap.get(id);
            return card ? { ...card, order: i } : null;
          })
          .filter(Boolean) as Flashcard[];
        return { ...d, cards: reordered, updatedAt: new Date().toISOString() };
      }),
    }));
  }, []);

  const markCardStudied = useCallback((deckId: string, cardId: string, studied: boolean) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) => (c.id === cardId ? { ...c, studied } : c)),
            }
          : d
      ),
    }));
  }, []);

  const rateCard = useCallback((deckId: string, cardId: string, rating: SRSRating) => {
    setData((prev) => ({
      ...prev,
      decks: prev.decks.map((d) =>
        d.id === deckId
          ? {
              ...d,
              cards: d.cards.map((c) =>
                c.id === cardId
                  ? { ...c, studied: true, srs: updateSRS(c.srs, rating) }
                  : c
              ),
            }
          : d
      ),
    }));
  }, []);

  const importDeck = useCallback((deck: Deck) => {
    setData((prev) => ({ ...prev, decks: [...prev.decks, deck] }));
  }, []);

  const addQuizAttempt = useCallback((attempt: Omit<QuizAttempt, "id">) => {
    setData((prev) => ({
      ...prev,
      quizHistory: [{ ...attempt, id: generateId() }, ...prev.quizHistory],
    }));
  }, []);

  const getDueCards = useCallback(
    (deckId?: string) => {
      const result: { deck: Deck; card: Flashcard }[] = [];
      const decks = deckId ? data.decks.filter((d) => d.id === deckId) : data.decks;
      for (const deck of decks) {
        for (const card of deck.cards) {
          if (isDueForReview(card.srs)) {
            result.push({ deck, card });
          }
        }
      }
      return result.sort(
        (a, b) => a.card.srs.nextReviewDate.localeCompare(b.card.srs.nextReviewDate)
      );
    },
    [data.decks]
  );

  const getAllSubjects = useCallback(
    () => [...new Set(data.decks.map((d) => d.subject).filter(Boolean))],
    [data.decks]
  );

  const value = useMemo(
    () => ({
      data,
      loaded,
      theme: data.settings.theme,
      setTheme,
      createDeck,
      updateDeck,
      deleteDeck,
      getDeck,
      addCards,
      updateCard,
      deleteCard,
      reorderCards,
      markCardStudied,
      rateCard,
      importDeck,
      addQuizAttempt,
      getDueCards,
      getAllSubjects,
    }),
    [
      data,
      loaded,
      setTheme,
      createDeck,
      updateDeck,
      deleteDeck,
      getDeck,
      addCards,
      updateCard,
      deleteCard,
      reorderCards,
      markCardStudied,
      rateCard,
      importDeck,
      addQuizAttempt,
      getDueCards,
      getAllSubjects,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
