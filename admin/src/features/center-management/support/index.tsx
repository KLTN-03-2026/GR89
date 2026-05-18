'use client'

import React from 'react'
import { SupportChatProvider } from './context/SupportChatProvider'
import { SupportMainInner } from './components/SupportMainInner'
import { SupportTicket } from './type'

export function SupportMain(props?: {
  initialTickets?: SupportTicket[]
  initialSelectedTicketId?: string
  initialSelectedTicket?: SupportTicket | null
}) {
  return (
    <SupportChatProvider
      initialTickets={props?.initialTickets || []}
      initialSelectedTicketId={props?.initialSelectedTicketId || ''}
      initialSelectedTicket={props?.initialSelectedTicket || null}
    >
      <SupportMainInner />
    </SupportChatProvider>
  )
}
