'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, PageHeader } from '@/components/common'
import { getReadingById } from '@/features/reading/services/api'
import { columnsReadingVocabulary } from './Columns'
import { DialogAddReadingVocabulary } from '@/features/reading/components/dialogs'
import { Reading, Vocabulary } from '@/features/reading/types'

export function ReadingVocabularyMain({ _id }: { _id: string }) {
  const [data, setData] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
    setLoading(true)
    getReadingById(_id)
      .then((res) => {
        const reading = res.data as unknown as Reading
        setTitle(reading?.title || '')

        const vocabulary = reading?.vocabulary || []

        const formattedVocabulary = vocabulary.map((vocab: Vocabulary, index: number) => ({
          ...vocab,
          _id: vocab._id || `temp-${index}`, // Ensure _id exists
          word: vocab.word || '',
          phonetic: vocab.phonetic || '',
          definition: vocab.definition || '',
          vietnamese: vocab.vietnamese || '',
          example: vocab.example || ''
        }))

        setData(formattedVocabulary)
      })
      .finally(() => setLoading(false))
  }, [_id, refresh])

  return (
    <>
      <div className="flex justify-between items-center">
        <header>
          <PageHeader title={`Reading: ${title}`} subtitle={`Quản lý từ vựng của bài đọc ${title}`} />
        </header>
        <DialogAddReadingVocabulary readingId={_id} callback={() => setRefresh(!refresh)} />
      </div>
      <Card>
        <CardContent>
          {data.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có từ vựng nào cho bài đọc này.</p>
              <p className="text-sm mt-2">Nhấn &quot;Thêm từ vựng&quot; để bắt đầu.</p>
            </div>
          ) : (
            <DataTable
              columns={columnsReadingVocabulary(_id, () => setRefresh(!refresh))}
              data={data}
              isLoading={loading}
              columnNameSearch="word"
            />
          )}
        </CardContent>
      </Card>
    </>
  )
}


