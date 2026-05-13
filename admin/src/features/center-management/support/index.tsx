'use client'

import React from 'react'
import { SupportChatProvider } from './context/SupportChatProvider'
import { SupportMainInner } from './components/SupportMainInner'

export function SupportMain() {
  return (
    <SupportChatProvider>
      <SupportMainInner />
    </SupportChatProvider>
  )
}
