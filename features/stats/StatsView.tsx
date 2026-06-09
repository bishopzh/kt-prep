"use client";

import { useMemo } from "react";
import { BarChart3, BookOpen, CheckCircle, RotateCcw, Trophy } from "lucide-react";
import { useApp } from "@/store/AppProvider";
import { isDueForReview } from "@/utils/srs";
import { gradeColor } from "@/utils/grading";

export function StatsView() {
  const { data } = useApp();

  const stats = useMemo(() => {
    const allCards = data.decks.flatMap((d) => d.cards);
    const studied = allCards.filter((c) => c.studied).length;
    const dueToday = allCards.filter((c) => isDueForReview(c.srs)).length;
    const quizAvg =
      data.quizHistory.length > 0
        ? Math.round(
            data.quizHistory.reduce((s, q) => s + q.percentage, 0) / data.quizHistory.length
          )
        : 0;

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const dailyStudied = last7Days.map((date) => {
      const count = data.quizHistory.filter((q) => q.date.startsWith(date)).length;
      return { date, count };
    });

    const maxDaily = Math.max(...dailyStudied.map((d) => d.count), 1);

    return { total: allCards.length, studied, dueToday, quizAvg, dailyStudied, maxDaily };
  }, [data]);

  const statCards = [
    { icon: BookOpen, label: "Всего карточек", value: stats.total, color: "text-primary" },
    { icon: CheckCircle, label: "Изучено", value: stats.studied, color: "text-emerald-500" },
    { icon: RotateCcw, label: "На повторение", value: stats.dueToday, color: "text-amber-500" },
    { icon: Trophy, label: "Успешность тестов", value: `${stats.quizAvg}%`, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <Icon className={`w-5 h-5 ${color} mb-3`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Активность за 7 дней</h2>
        </div>
        <div className="flex items-end gap-2 h-32">
          {stats.dailyStudied.map(({ date, count }) => (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg bg-primary/80 transition-all"
                style={{ height: `${(count / stats.maxDaily) * 100}%`, minHeight: count > 0 ? "8px" : "2px" }}
              />
              <span className="text-[10px] text-muted">
                {new Date(date).toLocaleDateString("ru", { weekday: "short" })}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3 text-center">Количество пройденных тестов</p>
      </div>

      {data.quizHistory.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="font-semibold mb-4">История тестов</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.quizHistory.slice(0, 20).map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover"
              >
                <div>
                  <p className="text-sm font-medium">{attempt.deckName}</p>
                  <p className="text-xs text-muted">
                    {new Date(attempt.date).toLocaleDateString("ru")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{attempt.correct}/{attempt.total}</span>
                  <span className={`font-bold ${gradeColor(attempt.grade)}`}>{attempt.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
