'use client'

import { Clock, ChevronRight, Play, CheckCircle2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import type { EntertainmentItem } from '../../services/entertainmentApi'

interface EntertainmentSuggestedProps {
  relatedItems: EntertainmentItem[]
  loading: boolean
  type?: 'movie' | 'music' | 'podcast'
}

export function EntertainmentSuggested({ relatedItems, loading, type }: EntertainmentSuggestedProps) {
  return (
    <div className="space-y-6 pt-10 border-t border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-2xl flex items-center gap-3 text-gray-900 dark:text-white">
          <Clock className="h-6 w-6 text-orange-500" />
          Nội dung gợi ý cho bạn
        </h3>
        <Link href={`/entertainment/${type}s`}>
          <Button variant="ghost" className="text-blue-600 font-bold hover:text-blue-700 hover:bg-blue-50 rounded-full">
            Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedItems.length > 0 ? (
          relatedItems.slice(0, 4).map((item) => (
            <Link
              key={item._id}
              href={`/entertainment/${type}s/${item._id}`}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              <div className="relative aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md">
                {item.thumbnailUrl && (
                  <Image
                    src={typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : item.thumbnailUrl.url}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-10 w-10 text-white fill-current" />
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded-lg text-[10px] text-white font-bold">
                  15:20
                </div>
              </div>
              <div className="space-y-2 px-1">
                <h4 className="text-base font-bold leading-snug line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1">
                    {item.author || 'Tác giả ẩn danh'}
                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                  <span>125K lượt xem</span>
                  <span className="h-1 w-1 bg-gray-300 rounded-full" />
                  <span>3 ngày trước</span>
                </div>
              </div>
            </Link>
          ))
        ) : loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
            <Video className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 italic">Không có nội dung gợi ý phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  )
}
