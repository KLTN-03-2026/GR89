'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable, PageHeader } from '@/components/common'
import { columnsReadingVocabularyTopic } from './ReadingVocabulary/Columns'
import { Reading } from '@/features/reading/types'
import { getReadingList } from '@/features/reading/services/api'

export function ReadingVocabularyTopicMain() {
  const [data, setData] = useState<Reading[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)

    const getReadings = async () => {
      await getReadingList()
        .then((res) => {
          const readings = (res.data || []) as Reading[]

          const formattedReadings = readings.map((reading: Reading) => ({
            ...reading,
            title: reading.title || '',
            description: reading.description || '',
            vocabulary: reading.vocabulary || [],
            quizzes: reading.quizzes || []
          }))

          setData(formattedReadings)
        })
        .finally(() => setLoading(false))
    }
    getReadings()
  }, [])

  return (
    <>
      <div className="flex justify-between items-center">
        <header>
          <PageHeader title="Reading" subtitle="Quản lý từ vựng theo bài đọc" />
        </header>
      </div>
      <Card>
        <CardContent>
          {data.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chưa có bài đọc nào.</p>
              <p className="text-sm mt-2">Hãy tạo bài đọc mới để bắt đầu.</p>
            </div>
          ) : (
            <DataTable columns={columnsReadingVocabularyTopic} data={data} isLoading={loading} columnNameSearch="title" />
          )}
        </CardContent>
      </Card>
    </>
  )
}


