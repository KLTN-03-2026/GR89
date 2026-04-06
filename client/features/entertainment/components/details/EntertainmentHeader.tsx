'use client'

import { Calendar, Eye, MoreVertical, Share2, ThumbsUp, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
}

export function EntertainmentHeader({ detail, categoryLabel }: EntertainmentHeaderProps) {
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
            <Button variant="outline" size="sm" className="rounded-full gap-2 hover:bg-blue-50 hover:text-blue-600 border-gray-200 transition-all active:scale-95">
              <ThumbsUp className="h-4 w-4" /> <span>124</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-full gap-2 hover:bg-blue-50 hover:text-blue-600 border-gray-200 transition-all active:scale-95">
              <Share2 className="h-4 w-4" /> <span>Chia sẻ</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-all active:scale-95">
              <MoreVertical className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-y border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-900 shadow-md group-hover:scale-105 transition-transform">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${detail.author || 'Author'}&background=random`} />
                <AvatarFallback>{(detail.author || 'A')[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900 p-0.5">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer transition-colors">
                  {detail.author || 'Tác giả ẩn danh'}
                </p>
                <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Official</Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">12.5K người theo dõi</p>
            </div>
          </div>
          <Button size="sm" className="rounded-full px-6 font-semibold bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-all active:scale-95">
            Theo dõi
          </Button>
        </div>
      </div>
    </div>
  )
}
