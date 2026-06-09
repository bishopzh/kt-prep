"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useKeyboard } from "@/hooks/useKeyboard";
import { loadFlashcardProgress, saveFlashcardProgress } from "@/utils/storage";
import type { Flashcard } from "@/types";

interface FlashcardModeProps {
  deckId: string;
  cards: Flashcard[];
  onMarkStudied: (cardId: string, studied: boolean) => void;
}

function shuffleIds(ids: string[]): string[] {
  const arr = [...ids];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function FlashcardMode({ deckId, cards, onMarkStudied }: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [order, setOrder] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadFlashcardProgress(deckId);
    if (saved && saved.shuffledOrder.length === cards.length) {
      setOrder(saved.shuffledOrder);
      setCurrentIndex(saved.currentIndex);
      setShuffled(saved.shuffled);
    } else {
      setOrder(cards.map((c) => c.id));
    }
  }, [deckId, cards]);

  const orderedCards = useMemo(() => {
    const map = new Map(cards.map((c) => [c.id, c]));
    return order.map((id) => map.get(id)).filter(Boolean) as Flashcard[];
  }, [cards, order]);

  const current = orderedCards[currentIndex];
  const total = orderedCards.length;

  const saveProgress = useCallback(
    (idx: number, ord: string[], shuf: boolean) => {
      saveFlashcardProgress({ deckId, currentIndex: idx, shuffled: shuf, shuffledOrder: ord });
    },
    [deckId]
  );

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setFlipped(false);
      saveProgress(next, order, shuffled);
    }
  }, [currentIndex, total, order, shuffled, saveProgress]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      setFlipped(false);
      saveProgress(prev, order, shuffled);
    }
  }, [currentIndex, order, shuffled, saveProgress]);

  const toggleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleShuffle = () => {
    const newOrder = shuffleIds(cards.map((c) => c.id));
    setOrder(newOrder);
    setCurrentIndex(0);
    setFlipped(false);
    setShuffled(true);
    saveProgress(0, newOrder, true);
  };

  const handleReset = () => {
    const defaultOrder = cards.map((c) => c.id);
    setOrder(defaultOrder);
    setCurrentIndex(0);
    setFlipped(false);
    setShuffled(false);
    saveProgress(0, defaultOrder, false);
  };

  useKeyboard({
    ArrowRight: goNext,
    ArrowLeft: goPrev,
    " ": toggleFlip,
  });

  if (total === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p>Нет карточек в этом наборе.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProgressBar current={currentIndex + 1} total={total} />

      <div
        className="perspective-1000 cursor-pointer"
        onClick={toggleFlip}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="relative w-full min-h-[280px] sm:min-h-[320px]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 rounded-2xl border border-border bg-surface shadow-lg p-8 flex items-center justify-center backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-lg sm:text-xl text-center font-medium leading-relaxed">
              {current?.question}
            </p>
            <span className="absolute bottom-4 text-xs text-muted">Нажмите или Space для ответа</span>
          </div>
          <div
            className="absolute inset-0 rounded-2xl border border-primary/30 bg-primary/5 shadow-lg p-8 flex items-center justify-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-lg sm:text-xl text-center leading-relaxed text-primary">
              {current?.answer}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="secondary" size="sm" onClick={goPrev} disabled={currentIndex === 0}>
          <ChevronLeft className="w-4 h-4" /> Назад
        </Button>
        <Button variant="secondary" size="sm" onClick={toggleFlip}>
          <RotateCcw className="w-4 h-4" /> Перевернуть
        </Button>
        <Button variant="secondary" size="sm" onClick={goNext} disabled={currentIndex >= total - 1}>
          Далее <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="ghost" size="sm" onClick={handleShuffle}>
          <Shuffle className="w-4 h-4" /> Перемешать
        </Button>
        {shuffled && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Сбросить порядок
          </Button>
        )}
        {current && (
          <Button
            variant={current.studied ? "secondary" : "primary"}
            size="sm"
            onClick={() => onMarkStudied(current.id, !current.studied)}
          >
            <CheckCircle className="w-4 h-4" />
            {current.studied ? "Изучено" : "Отметить как изучено"}
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-muted">
        ← → навигация · Space — переворот
      </p>
    </div>
  );
}
