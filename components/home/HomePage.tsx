"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Search, Upload, BookOpen } from "lucide-react";
import { useApp } from "@/store/AppProvider";
import { DeckCard } from "@/components/decks/DeckCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { importDeckFromJSON } from "@/utils/import-export";

export function HomePage() {
  const { data, loaded, importDeck, getAllSubjects } = useApp();
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const subjects = getAllSubjects();

  const filteredDecks = useMemo(() => {
    return data.decks.filter((deck) => {
      const matchesSearch =
        !search ||
        deck.name.toLowerCase().includes(search.toLowerCase()) ||
        deck.subject.toLowerCase().includes(search.toLowerCase()) ||
        deck.cards.some(
          (c) =>
            c.question.toLowerCase().includes(search.toLowerCase()) ||
            c.answer.toLowerCase().includes(search.toLowerCase())
        );
      const matchesSubject = !subjectFilter || deck.subject === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [data.decks, search, subjectFilter]);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const deck = importDeckFromJSON(ev.target?.result as string);
      if (deck) importDeck(deck);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Мои наборы</h1>
          <p className="text-muted mt-1">Подготовка к Комплексному тестированию</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportJSON}
          />
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4" /> Импорт JSON
          </Button>
          <Link href="/decks/new">
            <Button size="sm">
              <Plus className="w-4 h-4" /> Новый набор
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <Input
            placeholder="Поиск по названию, предмету или карточкам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {subjects.length > 0 && (
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Все предметы</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>

      {filteredDecks.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">
            {data.decks.length === 0 ? "Создайте первый набор" : "Ничего не найдено"}
          </h2>
          <p className="text-muted text-sm mb-6">
            {data.decks.length === 0
              ? "Добавьте карточки для подготовки к КТ"
              : "Попробуйте изменить параметры поиска"}
          </p>
          {data.decks.length === 0 && (
            <Link href="/decks/new">
              <Button><Plus className="w-4 h-4" /> Создать набор</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      )}
    </div>
  );
}
