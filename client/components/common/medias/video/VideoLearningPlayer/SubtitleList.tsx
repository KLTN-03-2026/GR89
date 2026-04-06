'use client'
import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import type { Subtitle } from './utils'
import { formatTime } from './utils'

interface SubtitleListProps {
  subtitles: Subtitle[]
  currentSubtitle: Subtitle | null
  onJumpToLine: (subtitle: Subtitle) => void
}

export default function SubtitleList({ subtitles, currentSubtitle, onJumpToLine }: SubtitleListProps) {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const listContainerRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll subtitle list để đưa dòng active lên đầu
  useEffect(() => {
    if (!currentSubtitle) return
    const index = subtitles.findIndex(s => s === currentSubtitle)
    const el = itemRefs.current[index]
    const container = listContainerRef.current
    if (el && container) {
      const paddingTop = Number.parseFloat(getComputedStyle(container).paddingTop || '0')
      const target = el.offsetTop - container.offsetTop - paddingTop
      container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
    }
  }, [currentSubtitle, subtitles])

  return (
    <div
      ref={listContainerRef}
      className="bg-white/90 border border-orange-100 rounded-2xl p-4 shadow-sm space-y-3 overflow-auto scroll-pt-3 h-[calc(100%+95px)]"
    >
      {subtitles.map((s, idx) => {
        const active = currentSubtitle === s
        return (
          <div
            key={idx}
            className={`group relative rounded-xl border cursor-pointer transition-all duration-200 px-4 py-3.5 w-full ${active
              ? 'bg-gradient-to-r from-sky-50 to-blue-50/50 border-sky-300 shadow-md shadow-sky-100/50 ring-2 ring-sky-200/50'
              : 'bg-orange-50/60 border-orange-200/60 hover:bg-orange-50 hover:border-orange-300 hover:shadow-sm'
              }`}
            onClick={() => onJumpToLine(s)}
            ref={(el) => { itemRefs.current[idx] = el }}
          >
            <div className='space-y-1.5'>
              <Badge
                variant={active ? 'default' : 'secondary'}
                className={`shrink-0 mt-0.5 ${active
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-orange-500/15 text-orange-700 border-orange-300/30'
                  }`}
              >
                {formatTime(s.start)} - {formatTime(s.end)}
              </Badge>
              <div className="flex-1 min-w-0">
                <p
                  className={`leading-relaxed ${active
                    ? 'text-sky-900 font-semibold'
                    : 'text-gray-800 font-medium group-hover:text-gray-900'
                    }`}
                >
                  {s.en}
                </p>
                <p
                  className={`text-sm leading-relaxed ${active ? 'text-sky-700/90' : 'text-gray-600 group-hover:text-gray-700'
                    }`}
                >
                  {s.vi}
                </p>
              </div>
            </div>
            {active && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-500 rounded-l-xl" />
            )}
          </div>
        )
      })}
    </div>
  )
}

