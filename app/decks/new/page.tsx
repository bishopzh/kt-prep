"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/store/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NewDeckPage() {
  const router = useRouter();
  const { createDeck } = useApp();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const deck = createDeck(name.trim(), subject.trim() || "Общий");
    router.push(`/decks/${deck.id}`);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Назад к наборам
      </Link>

      <h1 className="text-2xl font-bold">Новый набор</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название набора"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Финансы — основы"
          required
        />
        <Input
          label="Предмет"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Например: Финансы"
        />
        <Button type="submit" className="w-full">Создать набор</Button>
      </form>
    </div>
  );
}
