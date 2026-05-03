import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface Props {
  handleStart: () => void
}

export default function DictationHasStarted({ handleStart }: Props) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-10 h-10 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Sẵn sàng chép chính tả</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
        Bạn sẽ nghe audio và gõ lại từng từ. Nhấn <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">Enter</kbd> hoặc <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs">Space</kbd> để xác nhận.
        Sau mỗi câu hoàn thành, bản dịch tiếng Việt sẽ hiện ra.
      </p>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 max-w-md mx-auto mb-4">
        Lưu ý: Không nhập các tiêu đề như &quot;Conversation 1/2/3&quot; khi chép chính tả.
      </p>
      <Button
        onClick={handleStart}
        className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-200/50 px-8 py-3 text-base font-semibold"
      >
        Bắt đầu chép chính tả
      </Button>
    </div>
  )
}
