import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { IDailySuggestionItem } from '@/features/dashboard/types';

export default function QuickActionCard({ title, description, href, icon, color, progress, isCompleted }: IDailySuggestionItem) {
  const currentProgress = progress || 0
  const safeHref = href || '#'
  const gradient = color || "from-blue-500 to-cyan-500"
  const IconComp = icon && icon in Icons ? Icons[icon as keyof typeof Icons] as React.FC : Icons.PlayCircle

  return (
    <Link href={safeHref} className="block w-full">
      <div className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-transparent transition-all duration-300 cursor-pointer group 
        ${isCompleted
          ? 'bg-gray-50/50 dark:bg-gray-800/40 opacity-70 grayscale-[20%]'
          : 'bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'
        }`}>

        <div className="flex items-center gap-4 min-w-0">
          <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0`}>
            {IconComp && <IconComp className="w-5 h-5 text-white" strokeWidth={2.5} />}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <span className={`text-sm font-semibold tracking-tight truncate ${isCompleted ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-300' : 'text-gray-800 dark:text-gray-100'}`}>
              {title}
            </span>

            {/* Progress Indicator */}
            {currentProgress > 0 && !isCompleted && (
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-700/50">
                  <div
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(currentProgress, 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400">{Math.round(currentProgress)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 sm:mt-0 ml-14 sm:ml-0 min-w-0">
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${isCompleted
            ? 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
            : 'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/80 group-hover:bg-gray-100 dark:group-hover:bg-gray-700'
            } truncate max-w-[220px] sm:max-w-[260px]`}>
            {description || ''}
          </span>
          {isCompleted && (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-sm shrink-0" />
          )}
        </div>
      </div>
    </Link>
  )
}
