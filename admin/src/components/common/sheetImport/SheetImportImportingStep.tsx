/**
 * Bước đang gọi API import: spinner + thanh tiến trình (ước lượng %, không phải byte thật).
 */
'use client'

import { Loader2 } from 'lucide-react'

import { Progress } from '@/components/ui/progress'

type SheetImportImportingStepProps = {
  percent: number
}

export function SheetImportImportingStep({ percent }: SheetImportImportingStepProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-gray-800">Đang import...</p>
        <p className="text-sm text-gray-500 mt-1">{percent}%</p>
      </div>
      <div className="w-full max-w-xs space-y-2">
        <Progress value={percent} className="h-3" />
      </div>
    </div>
  )
}
