import type { Deck, Flashcard } from "@/types";
import { createDefaultSRS } from "./srs";
import { generateId } from "./id";

export function parseImportText(text: string): Pick<Flashcard, "question" | "answer">[] {
  const cards: Pick<Flashcard, "question" | "answer">[] = [];
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    let question = "";
    let answer = "";

    for (const line of lines) {
      const qMatch = line.match(/^Вопрос:\s*(.+)/i);
      const aMatch = line.match(/^Ответ:\s*(.+)/i);
      if (qMatch) question = qMatch[1].trim();
      else if (aMatch) answer = aMatch[1].trim();
    }

    if (question && answer) {
      cards.push({ question, answer });
    }
  }

  if (cards.length === 0) {
    const qRegex = /Вопрос:\s*([\s\S]+?)(?=\nОтвет:|\n\n|$)/gi;
    const aRegex = /Ответ:\s*([\s\S]+?)(?=\nВопрос:|\n\n|$)/gi;
    const questions = [...text.matchAll(qRegex)].map((m) => m[1].trim());
    const answers = [...text.matchAll(aRegex)].map((m) => m[1].trim());

    for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
      cards.push({ question: questions[i], answer: answers[i] });
    }
  }

  return cards;
}

export function createFlashcardsFromImport(
  items: Pick<Flashcard, "question" | "answer">[],
  startOrder = 0
): Flashcard[] {
  return items.map((item, i) => ({
    id: generateId(),
    question: item.question,
    answer: item.answer,
    order: startOrder + i,
    studied: false,
    srs: createDefaultSRS(),
  }));
}

export function exportDeckToJSON(deck: Deck): string {
  return JSON.stringify(deck, null, 2);
}

export function importDeckFromJSON(json: string): Deck | null {
  try {
    const parsed = JSON.parse(json) as Deck;
    if (!parsed.name || !Array.isArray(parsed.cards)) return null;
    return {
      ...parsed,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cards: parsed.cards.map((card, i) => ({
        ...card,
        id: generateId(),
        order: i,
        studied: card.studied ?? false,
        srs: card.srs ?? createDefaultSRS(),
      })),
    };
  } catch {
    return null;
  }
}

export function exportAllDecksToJSON(decks: Deck[]): string {
  return JSON.stringify(decks, null, 2);
}
