'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, PageHeader } from '@/components/common'
import { getVocabularyQuizzesByTopic } from '@/features/vocabulary/services/api'
import { Quiz } from '@/types'
import { columnsVocabularyQuizDetail } from '../../table/vocabulary-quiz-detail/Columns'
import { DialogAddVocabularyQuiz } from '../../dialog'

export function VocabularyQuizDetailMain({ _id }: { _id: string }) {
  const [data, setData] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    setLoading(true)
    getVocabularyQuizzesByTopic(_id)
      .then((res) => {

        const quizzes = (res.data || []) as Quiz[]
        setData(quizzes)
        setTitle('Vocabulary Topic')
      })
      .finally(() => setLoading(false))
  }, [_id, refresh])
  return (
    <>
      <div className="flex justify-between items-center">
        <header>
          <PageHeader title={`Topic: ${title}`} subtitle={`Quản lý quiz của chủ đề`} />
        </header>
        <DialogAddVocabularyQuiz topicId={_id} onSuccess={() => setRefresh(!refresh)} />
      </div>
      <Card>
        <CardContent>
          <DataTable columns={columnsVocabularyQuizDetail(_id, () => setRefresh(!refresh))} data={data} isLoading={loading} columnNameSearch="question" />
        </CardContent>
      </Card>
    </>
  )
}


