'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'
import { Skeleton } from '@/components/ui/skeleton'
import { ChatList } from './ChatList'
import { ChatHeader } from './ChatHeader'
import { MessageInput } from './MessageInput'
import { SupportEmptyState } from './SupportEmptyState'
import { SupportMessageRow } from './SupportMessageRow'
import { useSupportChat } from '../context/SupportChatProvider'
import { uploadSupportAttachmentForStaff } from '../services/api'
import { SupportAttachment, SupportMessage } from '../type'

export function SupportMainInner() {
  const {
    tickets,
    selectedTicketId,
    selectedTicket,
    newCount,
    canTakeOver,
    canReply,
    isSelectedTicketLoading,
    selectTicketId,
    claimSelectedTicket,
    sendMessageAsStaff,
  } = useSupportChat()

  const [isMobileListOpen, setIsMobileListOpen] = useState(false)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (lastMessageRef.current && selectedTicket) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedTicket])

  const handleSendMessage = async (content: string) => {
    await sendMessageAsStaff(content)
  }

  const handleSendFile = async (file: File) => {
    if (!selectedTicketId) return
    setIsUploading(true)
    await uploadSupportAttachmentForStaff(file)
      .then(async (res) => {
        const attachments = res as SupportAttachment 
        if (!attachments) {
          toast.error('Không thể gửi tệp lúc này')
          return
        }
        await sendMessageAsStaff('', attachments)
      })
      .finally(() => setIsUploading(false))
  }

  const messages: SupportMessage[] = selectedTicket?.messages || []
  const selectedName = selectedTicket?.requester?.fullName || 'Học viên'
  const hasMessages = messages.length > 0

  const LoadingMessages = () => (
    <div className="space-y-4">
      {Array.from({ length: 7 }).map((_, i) => {
        const isRight = i % 3 === 0
        return (
          <div key={i} className={cn('flex', isRight ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[78%] rounded-3xl p-4 bg-white border border-gray-100 shadow-sm', isRight ? 'rounded-tr-lg' : 'rounded-tl-lg')}>
              <Skeleton className="h-3 w-44" />
              <Skeleton className="h-3 w-64 mt-2" />
              <Skeleton className="h-3 w-32 mt-2" />
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="relative flex h-[calc(100vh-110px)] bg-white rounded-3xl overflow-hidden">
      <ChatList
        tickets={tickets}
        selectedChatId={selectedTicketId}
        onSelectTicket={(t) => selectTicketId(t._id)}
        newCount={newCount}
        className="w-80 xl:w-96"
      />

      <div className="lg:hidden">
        <div
          className={cn(
            'absolute inset-0 z-30 transition-opacity duration-300',
            isMobileListOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          )}
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsMobileListOpen(false)} aria-hidden />
        </div>
        <div
          className={cn(
            'absolute inset-y-0 left-0 z-40 w-96 max-w-[90%] border-r border-gray-200 bg-white transform transition-transform duration-300 ease-out',
            isMobileListOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <ChatList
            tickets={tickets}
            selectedChatId={selectedTicketId}
            onSelectTicket={(t) => {
              selectTicketId(t._id)
              setIsMobileListOpen(false)
            }}
            newCount={newCount}
            hideOnMobile={false}
            className="w-full h-full"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader
          selectedTicket={selectedTicket}
          onOpenList={() => setIsMobileListOpen(true)}
          isLoading={isSelectedTicketLoading}
        />

        <ScrollArea className="flex-1 overflow-auto bg-gray-50/50">
          <div className="p-8 space-y-6">
            {isSelectedTicketLoading ? (
              <LoadingMessages />
            ) : !selectedTicket ? (
              <SupportEmptyState title="Chọn một ticket để bắt đầu" description="Danh sách ticket nằm ở cột bên trái." />
            ) : !hasMessages ? (
              <SupportEmptyState title="Chưa có tin nhắn" description="Khi học viên gửi tin, nội dung sẽ hiển thị ở đây." />
            ) : (
              <div className="flex justify-center">
                <Badge
                  variant="secondary"
                  className="bg-white text-gray-400 font-bold py-1 px-4 rounded-full shadow-sm border-gray-100 uppercase tracking-widest text-[10px]"
                >
                  Hôm nay, 20/05/2024
                </Badge>
              </div>
            )}

            {!isSelectedTicketLoading && hasMessages &&
              messages.map((msg, index) => (
                <SupportMessageRow
                  key={msg._id}
                  msg={msg}
                  studentName={selectedName}
                  isLast={index === messages.length - 1}
                  lastMessageRef={lastMessageRef}
                />
              ))}
          </div>
        </ScrollArea>

        <div className="border-t border-gray-200">
          {!canReply && !isSelectedTicketLoading && selectedTicket?.status === 'open' && (
            <div className="px-6 pt-4">
              {selectedTicket?.assignedTo ? (
                <p className="text-xs font-bold text-gray-500">
                  Ticket đang được xử lý bởi {selectedTicket.assignedTo.fullName || 'nhân sự khác'}.
                </p>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-bold text-gray-500">Ticket chưa có ai nhận.</div>
                  <button
                    onClick={claimSelectedTicket}
                    disabled={!canTakeOver}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${
                      canTakeOver ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Nhận phản hồi
                  </button>
                </div>
              )}
            </div>
          )}
          <MessageInput
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            disabled={!canReply || isUploading || isSelectedTicketLoading}
          />
        </div>
      </div>
    </div>
  )
}
