"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { parseImportText, createFlashcardsFromImport } from "@/utils/import-export";
import type { Flashcard } from "@/types";

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (cards: Flashcard[]) => void;
  startOrder?: number;
}

const EXAMPLE = `Вопрос: Что такое финансы?
Ответ: Экономические отношения по формированию и использованию денежных фондов.

Вопрос: Что такое бюджет?
Ответ: План доходов и расходов.`;

export function ImportModal({ open, onClose, onImport, startOrder = 0 }: ImportModalProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    const parsed = parseImportText(text);
    if (parsed.length === 0) {
      setError("Не удалось распознать карточки. Проверьте формат.");
      return;
    }
    const cards = createFlashcardsFromImport(parsed, startOrder);
    onImport(cards);
    setText("");
    setError("");
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Импорт карточек">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Вставьте текст в формате «Вопрос: ... / Ответ: ...». Каждая пара — отдельная карточка.
        </p>
        <Textarea
          label="Текст для импорта"
          value={text}
          onChange={(e) => { setText(e.target.value); setError(""); }}
          placeholder={EXAMPLE}
          rows={10}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button onClick={handleImport}>Импортировать</Button>
        </div>
      </div>
    </Modal>
  );
}
