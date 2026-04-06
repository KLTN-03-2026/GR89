import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

type Tone = "blue" | "emerald" | "rose" | "indigo" | "amber" | "slate"

const toneClasses: Record<Tone, { iconWrap: string; icon: string }> = {
  blue: { iconWrap: "bg-blue-600 shadow-blue-200", icon: "text-white" },
  emerald: { iconWrap: "bg-emerald-600 shadow-emerald-200", icon: "text-white" },
  rose: { iconWrap: "bg-rose-600 shadow-rose-200", icon: "text-white" },
  indigo: { iconWrap: "bg-indigo-600 shadow-indigo-200", icon: "text-white" },
  amber: { iconWrap: "bg-amber-600 shadow-amber-200", icon: "text-white" },
  slate: { iconWrap: "bg-slate-900 shadow-slate-200", icon: "text-white" },
}

export function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  tone = "blue",
  actions,
}: {
  title: string
  subtitle?: string
  icon: LucideIcon
  tone?: Tone
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shadow-lg ${toneClasses[tone].iconWrap}`}>
            <Icon className={`w-6 h-6 ${toneClasses[tone].icon}`} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        </div>
        {subtitle ? <p className="text-gray-500 font-medium">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  )
}

