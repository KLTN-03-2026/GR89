'use client'
import { useState } from 'react'
import IpaContent from './IpaContent'
import IpaHeader from './IpaHeader'

export function IpaMain() {
  const [refresh, setRefresh] = useState(false)

  return (
    <div className="space-y-6">
      <IpaHeader callback={() => setRefresh(prev => !prev)} />

      <IpaContent
        refresh={refresh}
        callback={() => setRefresh(prev => !prev)}
      />
    </div>
  )
}