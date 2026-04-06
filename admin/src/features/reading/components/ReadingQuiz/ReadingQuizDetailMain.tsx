'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, PageHeader } from '@/components/common'
import { getReadingById } from '@/features/reading/services/api'
import { Reading } from '@/features/reading/types'
import { columnsReadingQuizDetail } from './Columns'
import { DialogAddReadingQuiz } from '@/features/reading/components/dialogs'

type TQuiz = Reading['quizzes'][number]

export function ReadingQuizDetailMain({ _id }: { _id: string }) {
  const [data, setData] = useState<TQuiz[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    setLoading(true)
    getReadingById(_id)
      .then((res) => {
        const reading = res.data as unknown as Reading
        setTitle(reading?.title || '')
        setData(reading?.quizzes || [])
      })
      .finally(() => setLoading(false))
  }, [_id, refresh])

  return (
    <>
      <div className="flex justify-between items-center">
        <header>
          <PageHeader title={`Reading: ${title}`} subtitle={`Quản lý quiz của bài đọc ${title}`} />
        </header>
        <DialogAddReadingQuiz readingId={_id} onSuccess={() => setRefresh(!refresh)} />
      </div>
      <Card>
        <CardContent>
          <DataTable columns={columnsReadingQuizDetail(_id, () => setRefresh(!refresh))} data={data} isLoading={loading} columnNameSearch="question" />
        </CardContent>
      </Card>
    </>
  )
}


