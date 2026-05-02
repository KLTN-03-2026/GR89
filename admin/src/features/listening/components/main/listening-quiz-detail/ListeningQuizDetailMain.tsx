'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader } from '@/components/common'
import { useRouter } from 'next/navigation'
import { getListeningQuizzes, type ListeningQuizDoc } from '@/features/listening/services/api'
import type { Listening } from '@/features/listening/types'
import { columnsListeningQuizDetail, type ListeningQuizRow } from '../../table/listening-quiz-detail/Columns'
import { SheetListeningQuiz } from '@/features/listening/components/dialog/SheetListeningQuiz'
import { ArrowLeft, ListChecks, Plus } from 'lucide-react'

interface ListeningQuizDetailMainProps {
  _id: string
  initialListening: Listening
  initialQuizzes: ListeningQuizDoc[]
}

export function ListeningQuizDetailMain({ _id, initialListening, initialQuizzes }: ListeningQuizDetailMainProps) {
  const router = useRouter()
  const [listening, setListening] = useState<Listening | null>(initialListening)
  const [quizzes, setQuizzes] = useState<ListeningQuizDoc[]>(initialQuizzes)
  const [loading, setLoading] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)

  // Syncing state with props
  const [prevListening, setPrevListening] = useState(initialListening)
  if (initialListening !== prevListening) {
    setListening(initialListening)
    setPrevListening(initialListening)
  }

  const [prevQuizzes, setPrevQuizzes] = useState(initialQuizzes)
  if (initialQuizzes !== prevQuizzes) {
    setQuizzes(initialQuizzes)
    setPrevQuizzes(initialQuizzes)
  }

  const rows: ListeningQuizRow[] = (quizzes || []).map((q, _index) => ({ ...q, _index }))

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/content/listening"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Danh sách bài nghe
          </Link>
          <PageHeader
            title={listening?.title || 'Đang tải...'}
            subtitle="Quiz lượt 1 — nghe hiểu ý chính (trắc nghiệm)"
          />
        </div>
        {listening && (
          <div className="flex gap-2">
            <Button size="sm" className="gap-2" onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          {!listening && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Không tìm thấy bài nghe.</p>
          ) : (
            <DataTable
              columns={columnsListeningQuizDetail(_id, () => router.refresh())}
              data={rows}
              isLoading={loading}
              columnNameSearch="question"
            />
          )}
        </CardContent>
      </Card>

      {listening && (
        <SheetListeningQuiz
          listening={listening}
          listeningId={_id}
          open={openAdd}
          onOpenChange={setOpenAdd}
          onSuccess={() => router.refresh()}
          mode="add"
        />
      )}

      {listening && rows.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-4">
          <ListChecks className="h-4 w-4" />
          Chưa có câu quiz. Nhấn &quot;Thêm câu hỏi&quot; để tạo câu trắc nghiệm cho bước nghe ý chính.
        </p>
      )}
    </>
  )
}
