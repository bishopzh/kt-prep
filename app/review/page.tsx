"use client";

import { useMemo } from "react";
import { useApp } from "@/store/AppProvider";
import { ReviewMode } from "@/features/srs/ReviewMode";

export default function DailyReviewPage() {
  const { getDueCards, rateCard } = useApp();
  const items = useMemo(() => getDueCards(), [getDueCards]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Daily Review</h1>
        <p className="text-muted mt-1">
          Карточки на повторение сегодня: {items.length}
        </p>
      </div>
      <ReviewMode items={items} onRate={rateCard} />
    </div>
  );
}
