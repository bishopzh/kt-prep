"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Deck, Flashcard, SRSRating } from "@/types";

interface ReviewItem {
  deck: Deck;
  card: Flashcard;
}

interface ReviewModeProps {
  items: ReviewItem[];
  onRate: (deckId: string, cardId: string, rating: SRSRating) => void;
}

const ratings: { key: SRSRating; label: string; color: string }[] = [
  { key: "again", label: "Снова", color: "bg-red-500 hover:bg-red-600 text-white" },
  { key: "hard", label: "Сложно", color: "bg-orange-500 hover:bg-orange-600 text-white" },
  { key: "good", label: "Нормально", color: "bg-blue-500 hover:bg-blue-600 text-white" },
  { key: "easy", label: "Легко", color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
];

export function ReviewMode({ items: initialItems, onRate }: ReviewModeProps) {
  const [items, setItems] = useState(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const current = items[currentIndex];

  if (initialItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-bold mb-2">Всё повторено!</h2>
        <p className="text-muted">Нет карточек на повторение сегодня.</p>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-bold mb-2">Сессия завершена!</h2>
        <p className="text-muted">Вы повторили все карточки на сегодня.</p>
      </div>
    );
  }

  const handleRate = (rating: SRSRating) => {
    onRate(current.deck.id, current.card.id, rating);
    const nextItems = items.filter((_, i) => i !== currentIndex);
    setItems(nextItems);
    setShowAnswer(false);
    if (currentIndex >= nextItems.length) {
      setCurrentIndex(Math.max(0, nextItems.length - 1));
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{current.deck.name} · {current.deck.subject}</span>
        <span>{currentIndex + 1} / {items.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.card.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="rounded-2xl border border-border bg-surface shadow-lg p-8 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
          onClick={() => !showAnswer && setShowAnswer(true)}
        >
          {!showAnswer ? (
            <>
              <p className="text-lg sm:text-xl font-medium text-center">{current.card.question}</p>
              <p className="text-xs text-muted mt-4">Нажмите, чтобы увидеть ответ</p>
            </>
          ) : (
            <p className="text-lg sm:text-xl text-center text-primary">{current.card.answer}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {ratings.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => handleRate(key)}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors ${color}`}
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
