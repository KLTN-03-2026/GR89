'use client'

import { Bot, Minimize2, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AIChatHeaderProps {
  onMinimize: () => void
  onClose: () => void
}

export default function AIChatHeader({ onMinimize, onClose }: AIChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-fuchsia-600 px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bot className="h-6 w-6" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
        </div>
        <div>
          <p className="text-sm font-semibold">Trợ lý AI</p>
          <p className="text-[11px] text-white/80">Phản hồi tức thì</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onMinimize}>
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
