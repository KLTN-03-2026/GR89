'use client'
import { useRouter } from 'next/navigation'
import GrammarTopicContent from './GrammarTopicContent'
import GrammarTopicHeader from './GrammarTopicHeader'
import { GrammarTopic } from '@/features/grammar/types'

interface GrammarTopicMainProps {
  initialData: GrammarTopic[]
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

export function GrammarTopicMain({ initialData, pagination }: GrammarTopicMainProps) {
  const router = useRouter()
  return (
    <div>
      <GrammarTopicHeader callback={() => router.refresh()} />
      <GrammarTopicContent 
        callback={() => router.refresh()} 
        initialData={initialData}
        pagination={pagination}
      />
    </div>
  )
}

