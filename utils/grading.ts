import type { Grade } from "@/types";

export function calculateGrade(percentage: number): Grade {
  if (percentage >= 90) return "A";
  if (percentage >= 75) return "B";
  if (percentage >= 60) return "C";
  return "D";
}

export function gradeColor(grade: Grade): string {
  const colors: Record<Grade, string> = {
    A: "text-emerald-600 dark:text-emerald-400",
    B: "text-blue-600 dark:text-blue-400",
    C: "text-amber-600 dark:text-amber-400",
    D: "text-red-600 dark:text-red-400",
  };
  return colors[grade];
}
