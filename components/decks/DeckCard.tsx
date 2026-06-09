"use client";

import Link from "next/link";
import { BookOpen, Layers } from "lucide-react";
import type { Deck } from "@/types";
import { isDueForReview } from "@/utils/srs";

interface DeckCardProps {
  deck: Deck;
}

export function DeckCard({ deck }: DeckCardProps) {
  const dueCount = deck.cards.filter((c) => isDueForReview(c.srs)).length;
  const studiedCount = deck.cards.filter((c) => c.studied).length;

  return (
    <Link
      href={`/decks/${deck.id}`}
      className="group block rounded-2xl border border-border bg-surface p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        {dueCount > 0 && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            {dueCount} на повторение
          </span>
        )}
      </div>
      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
        {deck.name}
      </h3>
      <p className="text-sm text-muted mb-4">{deck.subject}</p>
      <div className="flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          {deck.cards.length} карточек
        </span>
        <span>{studiedCount} изучено</span>
      </div>
    </Link>
  );
}
