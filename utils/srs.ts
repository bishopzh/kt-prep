import type { SRSData, SRSRating } from "@/types";

export function createDefaultSRS(): SRSData {
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString().split("T")[0],
  };
}

export function updateSRS(current: SRSData, rating: SRSRating): SRSData {
  const today = new Date().toISOString().split("T")[0];
  let { easeFactor, interval, repetitions } = current;

  switch (rating) {
    case "again":
      repetitions = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    case "hard":
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      repetitions += 1;
      break;
    case "good":
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
      break;
    case "easy":
      if (repetitions === 0) {
        interval = 2;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      repetitions += 1;
      easeFactor += 0.15;
      break;
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReviewDate: nextDate.toISOString().split("T")[0],
  };
}

export function isDueForReview(srs: SRSData, date?: string): boolean {
  const today = date ?? new Date().toISOString().split("T")[0];
  return srs.nextReviewDate <= today;
}

export function daysUntilReview(srs: SRSData): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reviewDate = new Date(srs.nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);
  return Math.ceil((reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
