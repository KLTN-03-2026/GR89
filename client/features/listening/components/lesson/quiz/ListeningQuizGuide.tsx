import { AudioSection } from '@/components/common/medias'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { IListening } from '@/features/listening/types'
import { Headphones, HelpCircle, Lightbulb } from 'lucide-react'
import React from 'react'

interface Props {
  listening: IListening
}

export default function ListeningQuizGuide({ listening }: Props) {
  return (
    <Card className="border-indigo-100/80 pt-0 shadow-[0_12px_32px_rgba(99,102,241,0.10)] overflow-hidden rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-indigo-100 text-xs font-semibold bg-white/10 px-2.5 py-1 rounded-full">
              <Headphones className="w-4 h-4" />
              Lượt 1 · Nghe hiểu ý chính
            </div>
            <h1 className="mt-2 text-[30px] leading-tight font-extrabold tracking-tight truncate">
              {listening.title}
            </h1>
            <p className="text-indigo-100/95 mt-1.5 text-sm leading-relaxed line-clamp-2">
              {listening.description}
            </p>
          </div>
        </div>
        <div className="mt-3">
          <Dialog >
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="bg-white/15 hover:bg-white/25 text-white border border-white/25"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Gợi ý cách học
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Cách học Listening hiệu quả</DialogTitle>
                <DialogDescription>
                  Làm theo 3 bước sau để nghe hiểu tốt hơn và ghi nhớ nội dung nhanh hơn.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm text-gray-700">
                <p><strong>Bước 1:</strong> Đọc trước câu hỏi để hiểu yêu cầu và xác định thông tin cần nghe.</p>
                <p><strong>Bước 2:</strong> Nghe trọn vẹn một lần để nắm ý chính, không tạm dừng và không tua lại, sau đó chọn đáp án trắc nghiệm.</p>
                <p><strong>Bước 3:</strong> Nộp bài, chuyển sang phần nghe chép chính tả và xem lại lý do vì sao mình chọn sai để rút kinh nghiệm.</p>
                <p className="text-gray-500">
                  Mẹo: Khi phân vân, hãy ưu tiên đáp án bám sát ý chính của toàn bộ đoạn hội thoại.
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4 bg-white">
        <p className="text-sm text-gray-600 flex items-center gap-2 font-medium">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          Nghe audio và trả lời 2–3 câu hỏi để nắm ý chính trước khi sang chép chính tả.
        </p>
        <div className="rounded-xl border border-indigo-100 p-3 shadow-sm bg-gradient-to-br from-white to-indigo-50/40">
          <AudioSection audioUrl={listening.audio || ''} />
        </div>
      </CardContent>
    </Card>
  )
}
