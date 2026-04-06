import { PopoverContent } from '@/components/ui/popover'
import { Lock } from 'lucide-react'

export function LockedContentPopover() {
  return (
    <PopoverContent className='w-96 bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0 shadow-2xl rounded-3xl p-8'>
      <div className="text-center space-y-6">
        <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="font-bold text-white text-xl">Chưa mở khóa</h3>
        <p className="text-sm text-gray-300 leading-relaxed">
          Bạn cần hoàn thành bài trước để mở khóa bài nghe này.
        </p>
        <div className="bg-gray-700 rounded-xl p-4">
          <p className="text-xs text-gray-400">Yêu cầu: Hoàn thành bài trước</p>
        </div>
      </div>
    </PopoverContent>
  )
}
