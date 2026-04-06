import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IStatsOverview } from "@/types";
import { TrendingUp } from "lucide-react";

export default function CardStatsOverview({ title, value, change, Icon, color }: IStatsOverview) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-current/10 to-current/5 rounded-bl-full"></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 bg-gradient-to-br ${color} rounded-xl text-white shadow-sm`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={`text-3xl font-bold mb-1 bg-gradient-to-r text-transparent bg-clip-text ${color}`}>{value}</div>
        <div className="flex items-center gap-1 text-xs text-emerald-600">
          <TrendingUp className="h-3 w-3" />
          <span>{change}</span>
        </div>
      </CardContent>
    </Card>
  )
}
