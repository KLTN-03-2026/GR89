'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, PageHeader } from '@/components/common'
import { getListeningById, getListeningQuizzes, type ListeningQuizDoc } from '@/features/listening/services/api'
import type { Listening } from '@/features/listening/types'
import { columnsListeningQuizDetail, type ListeningQuizRow } from '../../table/listening-quiz-detail/Columns'
import { SheetListeningQuiz } from '@/features/listening/components/dialog/SheetListeningQuiz'
import { ArrowLeft, ListChecks, Plus } from 'lucide-react'

export function ListeningQuizDetailMain({ _id }: { _id: string }) {
  const [listening, setListening] = useState<Listening | null>(null)
  const [quizzes, setQuizzes] = useState<ListeningQuizDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [openAdd, setOpenAdd] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getListeningById(_id), getListeningQuizzes(_id)])
      .then(([lRes, qRes]) => {
        if (cancelled) return
        setListening(lRes.data ?? null)
        setQuizzes(qRes.data ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [_id, refresh])

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
              columns={columnsListeningQuizDetail(_id, () => setRefresh((n) => n + 1))}
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
          onSuccess={() => setRefresh((n) => n + 1)}
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
