'use client'

import { Headset, Minimize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HumanChatHeaderProps {
  onMinimize: () => void
  onClose: () => void
}

export default function HumanChatHeader({ onMinimize, onClose }: HumanChatHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Headset className="h-6 w-6" />
          <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-indigo-500 bg-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">Hỗ trợ trực tuyến</p>
          <p className="text-[11px] text-white/80">Chúng tôi luôn sẵn sàng giúp bạn</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 rounded-lg" onClick={onMinimize}>
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8 rounded-lg" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
