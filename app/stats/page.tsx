import { StatsView } from "@/features/stats/StatsView";

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Статистика</h1>
      <StatsView />
    </div>
  );
}
