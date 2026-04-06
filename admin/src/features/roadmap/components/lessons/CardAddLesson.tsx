'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, Eye, FileText, Headphones, Mic, PenTool, Target } from 'lucide-react'
import { SheetAddLesson } from './SheetAddLesson'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface CardAddLessonProps {
  roadmapId: string
  onLessonsChange?: () => void
}

type LessonType = 'vocabulary' | 'grammar' | 'ipa' | 'listening' | 'speaking' | 'reading' | 'writing' | 'review'

export default function CardAddLesson({ roadmapId, onLessonsChange }: CardAddLessonProps) {
  const [selectedType, setSelectedType] = useState<LessonType | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const AddButtonLesson: {
    icon: React.ElementType
    label: string
    type: LessonType
    color: string
    bgColor: string
  }[] = [
      {
        icon: BookOpen,
        label: "Từ vựng",
        type: "vocabulary",
        color: "text-rose-600",
        bgColor: "bg-rose-50"
      },
      {
        icon: FileText,
        label: "Ngữ pháp",
        type: "grammar",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50"
      },
      {
        icon: Mic,
        label: "IPA",
        type: "ipa",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50"
      },
      {
        icon: Headphones,
        label: "Luyện Nghe",
        type: "listening",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      },
      {
        icon: Mic,
        label: "Luyện Nói",
        type: "speaking",
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      },
      {
        icon: Eye,
        label: "Luyện Đọc",
        type: "reading",
        color: "text-cyan-600",
        bgColor: "bg-cyan-50"
      },
      {
        icon: PenTool,
        label: "Luyện Viết",
        type: "writing",
        color: "text-violet-600",
        bgColor: "bg-violet-50"
      },
      {
        icon: Target,
        label: "Kiểm tra",
        type: "review",
        color: "text-slate-600",
        bgColor: "bg-slate-50"
      }
    ]

  const handleButtonClick = (type: LessonType) => {
    setSelectedType(type)
    setIsDialogOpen(true)
  }

  return (
    <>
      <div className='mt-8 p-6 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200'>
        <div className="flex items-center gap-2 mb-4 px-2">
          <Plus className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Thêm nội dung bài học</span>
        </div>
        <div className='flex flex-wrap gap-3'>
          {
            AddButtonLesson.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                size="sm"
                onClick={() => handleButtonClick(item.type)}
                className={cn(
                  "h-10 px-4 rounded-xl border-white bg-white shadow-sm hover:shadow-md transition-all font-bold gap-2 hover:scale-105 active:scale-95",
                  item.color
                )}
              >
                <div className={cn("p-1.5 rounded-lg", item.bgColor)}>
                  <item.icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-gray-700">{item.label}</span>
              </Button>
            ))
          }
        </div>
      </div>

      {selectedType && (
        <SheetAddLesson
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          roadmapId={roadmapId}
          lessonType={selectedType}
          lessonTypeLabel={AddButtonLesson.find(item => item.type === selectedType)?.label || ''}
          onLessonsChange={onLessonsChange}
        />
      )}
    </>
  )
}
