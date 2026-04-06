import { IStatsOverview } from "@/types";
import CardStatsOverview from "./CardStatsOverview";

export default function StatsOverview({ statsOverview }: { statsOverview: IStatsOverview[] }) {
  return (
    <div className={
      statsOverview.length === 3
        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4"
        : statsOverview.length === 4
          ? "grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4"
    }>
      {statsOverview.length > 0 && statsOverview.map((stat: IStatsOverview) => (
        <CardStatsOverview key={stat.title} {...stat} />
      ))}
    </div>
  )
}
