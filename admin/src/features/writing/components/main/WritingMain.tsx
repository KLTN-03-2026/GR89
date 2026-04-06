'use client'
import { useState } from 'react'
import WritingContent from './WritingContent'
import WritingHeader from './WritingHeader'

export function WritingMain() {
  const [refresh, setRefresh] = useState(false)

  return (
    <div>
      <WritingHeader callback={() => setRefresh(!refresh)} />
      <WritingContent refresh={refresh} callback={() => setRefresh(!refresh)} />
    </div>
  )
}
