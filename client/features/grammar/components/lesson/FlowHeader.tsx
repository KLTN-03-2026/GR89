'use client'

import { BookOpen, Sparkles } from 'lucide-react'
import { StudyStage } from "../../types"
import { motion } from 'framer-motion'
import { cn } from '@/libs/utils'

interface FlowHeaderProps {
  title: string,
  stage: StudyStage
}

export function FlowHeader({ title, stage }: FlowHeaderProps) {
  const getStageConfig = () => {
    switch (stage) {
      case 'theory':
        return { label: 'LÝ THUYẾT', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
      case 'practice':
        return { label: 'LUYỆN TẬP', icon: Sparkles, color: 'bg-purple-50 text-purple-600 border-purple-100' }
      default:
        return { label: 'LÝ THUYẾT', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    }
  }

  const config = getStageConfig()

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-950 px-6 py-6 shadow-xl shadow-slate-200/40 dark:shadow-none md:px-8 relative overflow-hidden group"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 to-transparent dark:from-slate-900/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Hệ thống học ngữ pháp</span>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">Premium</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Lộ trình: <span className="text-emerald-500">Lý thuyết</span> → <span className="text-purple-500">Luyện tập</span> → kiểm tra
          </p>
        </div>

        <motion.div
          key={stage}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "flex items-center gap-2.5 rounded-2xl border px-5 py-2.5 text-xs font-black uppercase tracking-widest shadow-sm",
            config.color
          )}
        >
          <config.icon className="w-4 h-4" />
          {config.label}
        </motion.div>
      </div>
    </motion.header>
  )
}
