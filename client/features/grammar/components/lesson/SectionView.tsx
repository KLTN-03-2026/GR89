'use client'

import { Volume2, Info, Lightbulb, Zap, Table as TableIcon, List as ListIcon } from 'lucide-react'
import type { LessonSection } from '@/features/grammar/types'
import { motion } from 'framer-motion'
import { cn } from '@/libs/utils'

interface SectionViewProps {
  section: LessonSection
}

export function SectionView({ section }: SectionViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Title & Description */}
      <div className="space-y-4">
        <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
          {section.title}
        </h2>
        {section.description && (
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic border-l-4 border-emerald-100 dark:border-emerald-900/30 pl-4">
            {section.description}
          </p>
        )}
      </div>

      {/* Note Section */}
      {section.note && (
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-amber-800/50 group"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 group-hover:rotate-12 transition-transform">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">Lưu ý quan trọng</span>
              <p className="text-[15px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed font-medium">
                {section.note}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Formula Section */}
      {section.formula && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-950 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-xs font-black uppercase tracking-widest">Cấu trúc / Công thức</span>
            </div>
            <p className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-200 text-center tracking-tight">
              {section.formula}
            </p>
          </div>
        </div>
      )}

      {/* Examples Section */}
      {section.examples && section.examples.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-lg font-black uppercase tracking-wider">Ví dụ minh họa</h3>
          </div>
          <div className="grid gap-4">
            {section.examples.map((example, idx) => (
              <motion.div 
                key={example.en}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md transition-all cursor-default"
              >
                <button className="mt-1 h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 group-hover:scale-110 transition-transform active:scale-95 shadow-sm">
                  <Volume2 className="h-5 w-5" />
                </button>
                <div className="space-y-1.5 py-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {example.en}
                  </p>
                  {example.vi && (
                    <p className="text-[15px] text-slate-500 dark:text-slate-400 font-medium italic">
                      {example.vi}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* List Section */}
      {section.list && section.list.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <ListIcon className="w-5 h-5" />
            <h3 className="text-lg font-black uppercase tracking-wider">Danh sách mở rộng</h3>
          </div>
          <ul className="grid gap-3">
            {section.list.map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-[15px] text-slate-700 dark:text-slate-300 font-medium">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table Section */}
      {section.table && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <TableIcon className="w-5 h-5" />
            <h3 className="text-lg font-black uppercase tracking-wider">Bảng so sánh / Tổng hợp</h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-gray-950">
            <div
              className="grid bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
              style={{ gridTemplateColumns: `repeat(${section.table.headers.length}, minmax(0, 1fr))` }}
            >
              {section.table.headers.map((header) => (
                <div className="p-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0" key={header}>
                  {header}
                </div>
              ))}
            </div>
            {section.table.rows.map((row, rowIdx) => (
              <div
                className={cn(
                  "grid border-b border-slate-100 dark:border-slate-900 last:border-b-0",
                  rowIdx % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-slate-50/30 dark:bg-slate-900/20"
                )}
                key={rowIdx}
                style={{ gridTemplateColumns: `repeat(${section.table?.headers.length || 1}, minmax(0, 1fr))` }}
              >
                {row.map((cell, cellIdx) => (
                  <div className="p-4 text-[15px] text-slate-700 dark:text-slate-300 font-medium text-center border-r border-slate-100 dark:border-slate-900 last:border-r-0" key={`${rowIdx}-${cellIdx}`}>
                    {cell}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
