'use client'
import { useState } from 'react'
import GrammarTopicContent from './GrammarTopicContent'
import GrammarTopicHeader from './GrammarTopicHeader'

export function GrammarTopicMain() {
  const [refresh, setRefresh] = useState(false)
  return (
    <div>
      <GrammarTopicHeader callback={() => setRefresh(!refresh)} />
      <GrammarTopicContent refresh={refresh} callback={() => setRefresh(!refresh)} />
    </div>
  )
}

