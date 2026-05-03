'use client'
import { useState } from 'react'
import IpaContent from './IpaContent'
import IpaHeader from './IpaHeader'
import { Ipa } from '@/features/IPA/types'

interface IpaMainProps {
  initialData: Ipa[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function IpaMain({ initialData, pagination }: IpaMainProps) {
  const [refresh, setRefresh] = useState(false)

  return (
    <div className="space-y-6">
      <IpaHeader callback={() => setRefresh(prev => !prev)} />

      <IpaContent
        refresh={refresh}
        callback={() => setRefresh(prev => !prev)}
        initialData={initialData}
        initialPagination={pagination}
      />
    </div>
  )
}