"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use, useMemo } from "react";
import { useApp } from "@/store/AppProvider";
import { ReviewMode } from "@/features/srs/ReviewMode";

export default function DeckReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getDeck, getDueCards, rateCard } = useApp();
  const deck = getDeck(id);

  const items = useMemo(() => getDueCards(id), [getDueCards, id]);

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
      <h1 className="text-xl font-bold text-center">Интервальное повторение</h1>
      <ReviewMode items={items} onRate={rateCard} />
    </div>
  );
}
