"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use } from "react";
import { useApp } from "@/store/AppProvider";
import { FlashcardMode } from "@/features/flashcards/FlashcardMode";

export default function FlashcardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getDeck, markCardStudied } = useApp();
  const deck = getDeck(id);

  if (!deck) {
    return <p className="text-center text-muted py-16">Набор не найден</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/decks/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> {deck.name}
      </Link>
      <h1 className="text-xl font-bold text-center">Режим карточек</h1>
      <FlashcardMode
        deckId={id}
        cards={deck.cards}
        onMarkStudied={(cardId, studied) => markCardStudied(id, cardId, studied)}
      />
    </div>
  );
}
