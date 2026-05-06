'use client'

import { Bot, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIChatMinimizedProps {
  onExpand: () => void
  onClose: () => void
}

export default function AIChatMinimized({ onExpand, onClose }: AIChatMinimizedProps) {
  return (
    <div
      onClick={onExpand}
      className="fixed bottom-6 right-6 z-50 w-80 cursor-pointer rounded-xl border border-purple-200 bg-white p-3 shadow-xl transition hover:shadow-2xl dark:bg-gray-800"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative text-purple-600 p-2">
            <Bot className="h-6 w-6" />
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Assistant</p>
            <p className="text-xs text-gray-500">Nhấp để trò chuyện tiếp</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className='text-purple-600'
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
