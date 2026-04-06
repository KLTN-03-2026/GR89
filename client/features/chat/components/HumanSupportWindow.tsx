'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HumanSupportWindowProps {
  onClose: () => void
}

export default function HumanSupportWindow({ onClose }: HumanSupportWindowProps) {
  return (
    <div className="fixed bottom-4 right-6 z-[2000] flex h-[400px] w-96 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">Chat với giáo viên</p>
          <p className="text-[11px] text-white/80">Hỗ trợ 1-1</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tính năng đang phát triển</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Chat trực tiếp với giáo viên sẽ sớm có mặt.</p>
        </div>
      </div>
    </div>
  )
}
