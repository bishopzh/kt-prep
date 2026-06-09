"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { generateQuiz } from "@/utils/quiz";
import { calculateGrade, gradeColor } from "@/utils/grading";
import type { Flashcard, Grade } from "@/types";

interface QuizModeProps {
  cards: Flashcard[];
  onComplete: (result: {
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
    grade: Grade;
  }) => void;
}

export function QuizMode({ cards, onComplete }: QuizModeProps) {
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => generateQuiz(cards), [cards, seed]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
    grade: Grade;
  } | null>(null);

  const current = questions[currentIndex];

  if (cards.length < 4) {
    return (
      <div className="text-center py-16 text-muted">
        <p>Для теста нужно минимум 4 карточки в наборе.</p>
        <p className="text-sm mt-2">Сейчас: {cards.length}</p>
      </div>
    );
  }

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelected(index);
    setAnswered(true);
    if (index === current.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const total = questions.length;
      const finalCorrect =
        selected === current.correctIndex ? correctCount : correctCount;
      const pct = Math.round((finalCorrect / total) * 100);
      const grade = calculateGrade(pct);
      const res = {
        total,
        correct: finalCorrect,
        incorrect: total - finalCorrect,
        percentage: pct,
        grade,
      };
      setResult(res);
      setFinished(true);
      onComplete(res);
    }
  };

  const restart = () => {
    setSeed((s) => s + 1);
    setCurrentIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setResult(null);
  };

  if (finished && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto text-center space-y-6 py-8"
      >
        <div className={`text-6xl font-bold ${gradeColor(result.grade)}`}>{result.grade}</div>
        <h2 className="text-2xl font-bold">Тест завершён!</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-emerald-600">{result.correct}</p>
            <p className="text-xs text-muted">Правильно</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-red-500">{result.incorrect}</p>
            <p className="text-xs text-muted">Ошибки</p>
          </div>
          <div className="rounded-xl border border-border p-4">
            <p className="text-2xl font-bold text-primary">{result.percentage}%</p>
            <p className="text-xs text-muted">Результат</p>
          </div>
        </div>
        <Button onClick={restart}>
          <RotateCcw className="w-4 h-4" /> Пройти снова
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProgressBar current={currentIndex + 1} total={questions.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <h2 className="text-lg sm:text-xl font-medium text-center p-6 rounded-2xl border border-border bg-surface shadow-sm">
            {current.question}
          </h2>

          <div className="grid gap-3">
            {current.options.map((option, i) => {
              let style = "border-border hover:border-primary/50 hover:bg-primary/5";
              if (answered) {
                if (i === current.correctIndex) style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                else if (i === selected) style = "border-red-500 bg-red-50 dark:bg-red-900/20";
                else style = "border-border opacity-50";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${style}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {answered && i === current.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                    {answered && i === selected && i !== current.correctIndex && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {answered && (
        <div className="flex justify-center">
          <Button onClick={handleNext}>
            {currentIndex < questions.length - 1 ? "Следующий вопрос" : "Завершить"}
          </Button>
        </div>
      )}
    </div>
  );
}
