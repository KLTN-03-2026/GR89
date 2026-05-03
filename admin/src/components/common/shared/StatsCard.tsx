import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Tone = "blue" | "emerald" | "rose" | "indigo" | "amber" | "slate";

const toneClasses: Record<Tone, { iconWrap: string; icon: string; badge: string }> = {
  blue: { iconWrap: "bg-blue-50", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  emerald: { iconWrap: "bg-emerald-50", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  rose: { iconWrap: "bg-rose-50", icon: "text-rose-600", badge: "bg-rose-100 text-rose-700" },
  indigo: { iconWrap: "bg-indigo-50", icon: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
  amber: { iconWrap: "bg-amber-50", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  slate: { iconWrap: "bg-slate-50", icon: "text-slate-700", badge: "bg-slate-200 text-slate-800" },
};

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  tone?: Tone;
}

export function StatsCard({ title, value, change, icon: Icon, tone }: StatsCardProps) {
  const resolvedTone = tone ?? (change?.isPositive ? "emerald" : "rose");
  const t = toneClasses[resolvedTone];
  return (
    <Card className="rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md transition-all p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${t.iconWrap} rounded-2xl`}>
          <Icon className={`w-6 h-6 ${t.icon}`} />
        </div>
        <Badge className={`${t.badge} border-none font-bold uppercase tracking-tighter`}>
          {change?.value || ""}
        </Badge>
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">{title}</p>
    </Card>
  );
}
