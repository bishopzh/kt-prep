import type { Flashcard, QuizQuestion } from "@/types";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateQuiz(cards: Flashcard[]): QuizQuestion[] {
  if (cards.length < 4) return [];

  return shuffle(cards).map((card) => {
    const wrongAnswers = shuffle(
      cards.filter((c) => c.id !== card.id).map((c) => c.answer)
    ).slice(0, 3);

    const options = shuffle([card.answer, ...wrongAnswers]);

    return {
      cardId: card.id,
      question: card.question,
      options,
      correctIndex: options.indexOf(card.answer),
    };
  });
}
