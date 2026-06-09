"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Check, X } from "lucide-react";
import type { Flashcard } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CardEditorProps {
  cards: Flashcard[];
  onUpdate: (cardId: string, question: string, answer: string) => void;
  onDelete: (cardId: string) => void;
  onReorder: (cardIds: string[]) => void;
}

function SortableCard({
  card,
  onUpdate,
  onDelete,
}: {
  card: Flashcard;
  onUpdate: (cardId: string, q: string, a: string) => void;
  onDelete: (cardId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const save = () => {
    onUpdate(card.id, question, answer);
    setEditing(false);
  };

  const cancel = () => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3"
    >
      <button
        className="mt-2 p-1 cursor-grab active:cursor-grabbing text-muted hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Вопрос" />
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Ответ" />
            <div className="flex gap-2">
              <Button size="sm" onClick={save}><Check className="w-3.5 h-3.5" /> Сохранить</Button>
              <Button size="sm" variant="ghost" onClick={cancel}><X className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ) : (
          <>
            <p className="font-medium text-sm mb-1">{card.question}</p>
            <p className="text-sm text-muted">{card.answer}</p>
          </>
        )}
      </div>

      {!editing && (
        <div className="flex gap-1 shrink-0">
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-surface-hover">
            <Pencil className="w-4 h-4 text-muted" />
          </button>
          <button onClick={() => onDelete(card.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
}

export function CardEditor({ cards, onUpdate, onDelete, onReorder }: CardEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    const reordered = [...cards];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered.map((c) => c.id));
  };

  if (cards.length === 0) {
    return (
      <p className="text-center text-muted py-8">Нет карточек. Добавьте вручную или импортируйте.</p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
