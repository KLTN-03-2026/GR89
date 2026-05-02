'use client'

import { useState } from 'react'
import VocabularyHeader from './VocabularyTopicHeader'
import VocabularyTopicContent from './VocabularyTopicContent'
import { VocabularyTopic } from '../../../types'

import { useRouter } from 'next/navigation'

interface VocabularyTopicMainProps {
  initialData: VocabularyTopic[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
    next: number | null
    prev: number | null
  }
}

export function VocabularyTopicMain({ initialData, pagination }: VocabularyTopicMainProps) {
  const router = useRouter()
  return (
    <>
      <VocabularyHeader callback={() => router.refresh()} />
      <VocabularyTopicContent
        callback={() => router.refresh()}
        initialData={initialData}
        pagination={pagination}
      />
    </>
  )
}
