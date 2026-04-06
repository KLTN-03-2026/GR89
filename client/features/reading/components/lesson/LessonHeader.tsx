'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, GraduationCap, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface LessonHeaderProps {
  title: string
  level: string
  backUrl: string
}

export function LessonHeader({ title, level, backUrl }: LessonHeaderProps) {
  const router = useRouter()
  const [time, setTime] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm shrink-0">
      <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(backUrl)}
            className="shrink-0 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold px-2 py-0">
                READING
              </Badge>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                LEVEL {level}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 font-mono text-sm font-bold">
            <Clock className="w-4 h-4" />
            {formatTime(time)}
          </div>
        </div>
      </div>
    </header>
  )
}
