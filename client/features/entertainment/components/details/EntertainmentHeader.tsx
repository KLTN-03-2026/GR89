'use client'

import { Calendar, Eye, MoreVertical, Share2, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/libs/utils'

interface EntertainmentHeaderProps {
  detail: {
    title: string
    author?: string
    createdAt?: string
    type?: 'movie' | 'music' | 'podcast'
  }
  categoryLabel: {
    label: string
    color: string
  }
  liked: boolean
  likesCount: number
  onToggleLike: () => void | Promise<void>
}

export function EntertainmentHeader({ detail, categoryLabel, liked, likesCount, onToggleLike }: EntertainmentHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className={cn("px-3 py-1 font-medium border", categoryLabel.color)}>
            {categoryLabel.label}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Eye className="h-3.5 w-3.5" />
            <span>2.4K lượt xem</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            {detail.title}
          </h1>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onToggleLike()}
              className={cn(
                "rounded-full gap-2 border-gray-200 transition-all active:scale-95",
                liked ? 'bg-blue-50 text-blue-600 border-blue-200' : 'hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              <ThumbsUp className="h-4 w-4" /> <span>{likesCount}</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-2 hover:bg-blue-50 hover:text-blue-600 border-gray-200 transition-all active:scale-95">
              <Share2 className="h-4 w-4" /> <span>Chia sẻ</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-all active:scale-95">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="py-4 border-y border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Tác giả: <span className="font-semibold text-gray-900 dark:text-white">{detail.author || 'Tác giả ẩn danh'}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
