'use client'

import { useState } from 'react'
import VocabularyHeader from './VocabularyTopicHeader'
import VocabularyTopicContent from './VocabularyTopicContent'

export function VocabularyTopicMain() {
  const [refresh, setRefresh] = useState(false)
  return (
    <>
      <VocabularyHeader callback={() => setRefresh(!refresh)} />
      <VocabularyTopicContent
        refresh={refresh}
        callback={() => setRefresh(!refresh)}
      />
    </>
  )
}
