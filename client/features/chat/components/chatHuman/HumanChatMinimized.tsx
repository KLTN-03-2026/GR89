'use client'

import { Headset, Maximize2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HumanChatMinimizedProps {
  onExpand: () => void
  onClose: () => void
}

export default function HumanChatMinimized({ onExpand, onClose }: HumanChatMinimizedProps) {
  return (
    <div className="fixed bottom-4 right-6 z-[2000] flex w-72 items-center justify-between rounded-xl border border-gray-100 bg-white p-3 shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onExpand}>
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Headset className="h-5 w-5" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
        </div>
        
        <div>
          <p className="text-sm font-black text-gray-900">Hỗ trợ trực tuyến</p>
          <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest">Đang kết nối...</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={onExpand}>
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
