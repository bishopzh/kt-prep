"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Layers,
  Brain,
  ClipboardList,
  RotateCcw,
  Plus,
  Upload,
  Download,
  Trash2,
  Pencil,
} from "lucide-react";
import { useApp } from "@/store/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { CardEditor } from "@/components/decks/CardEditor";
import { ImportModal } from "@/components/decks/ImportModal";
import { exportDeckToJSON } from "@/utils/import-export";
import { isDueForReview } from "@/utils/srs";
import type { Flashcard } from "@/types";

interface DeckDetailProps {
  deckId: string;
}

export function DeckDetail({ deckId }: DeckDetailProps) {
  const router = useRouter();
  const {
    getDeck,
    updateDeck,
    deleteDeck,
    addCards,
    updateCard,
    deleteCard,
    reorderCards,
  } = useApp();

  const deck = getDeck(deckId);
  const [importOpen, setImportOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  if (!deck) {
    return (
      <div className="text-center py-16">
        <p className="text-muted mb-4">Набор не найден</p>
        <Link href="/"><Button variant="secondary">На главную</Button></Link>
      </div>
    );
  }

  const dueCount = deck.cards.filter((c) => isDueForReview(c.srs)).length;

  const handleAddCard = () => {
    if (!newQ.trim() || !newA.trim()) return;
    addCards(deckId, [{ question: newQ.trim(), answer: newA.trim() }]);
    setNewQ("");
    setNewA("");
  };

  const handleImport = (cards: Flashcard[]) => {
    addCards(deckId, cards.map((c) => ({ question: c.question, answer: c.answer })));
  };

  const handleExport = () => {
    const json = exportDeckToJSON(deck);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${deck.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openEdit = () => {
    setEditName(deck.name);
    setEditSubject(deck.subject);
    setEditOpen(true);
  };

  const saveEdit = () => {
    updateDeck(deckId, { name: editName, subject: editSubject });
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteDeck(deckId);
    router.push("/");
  };

  const modes = [
    { href: `/decks/${deckId}/flashcards`, icon: Layers, label: "Карточки", desc: "Изучение с переворотом" },
    { href: `/decks/${deckId}/quiz`, icon: ClipboardList, label: "Тест", desc: "4 варианта ответа" },
    { href: `/decks/${deckId}/review`, icon: RotateCcw, label: "Повторение", desc: `${dueCount} на сегодня`, disabled: dueCount === 0 },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{deck.name}</h1>
          <p className="text-muted mt-1">{deck.subject} · {deck.cards.length} карточек</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={openEdit}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map(({ href, icon: Icon, label, desc, disabled }) =>
          disabled ? (
            <div
              key={href}
              className="rounded-2xl border border-border bg-surface/50 p-5 opacity-50 cursor-not-allowed"
            >
              <Icon className="w-6 h-6 text-muted mb-2" />
              <p className="font-semibold">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </div>
          ) : (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <Icon className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold">{label}</p>
              <p className="text-xs text-muted">{desc}</p>
            </Link>
          )
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Карточки
          </h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4" /> Импорт
            </Button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            placeholder="Вопрос"
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
          />
          <Input
            placeholder="Ответ"
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={handleAddCard} disabled={!newQ.trim() || !newA.trim()}>
          <Plus className="w-4 h-4" /> Добавить карточку
        </Button>

        <CardEditor
          cards={deck.cards.sort((a, b) => a.order - b.order)}
          onUpdate={(cardId, q, a) => updateCard(deckId, cardId, { question: q, answer: a })}
          onDelete={(cardId) => deleteCard(deckId, cardId)}
          onReorder={(ids) => reorderCards(deckId, ids)}
        />
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        startOrder={deck.cards.length}
      />

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Редактировать набор">
        <div className="space-y-4">
          <Input label="Название" value={editName} onChange={(e) => setEditName(e.target.value)} />
          <Input label="Предмет" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Отмена</Button>
            <Button onClick={saveEdit}>Сохранить</Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Удалить набор?">
        <p className="text-sm text-muted mb-4">
          Набор «{deck.name}» и все карточки будут удалены безвозвратно.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Отмена</Button>
          <Button variant="danger" onClick={handleDelete}>Удалить</Button>
        </div>
      </Modal>
    </div>
  );
}
