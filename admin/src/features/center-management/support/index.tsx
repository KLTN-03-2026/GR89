'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCheck, FileText, Download, MessagesSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SupportMessage } from './type'
import { ChatList } from './components/ChatList'
import { ChatHeader } from './components/ChatHeader'
import { MessageInput } from './components/MessageInput'
import { SupportChatProvider, useSupportChat } from './context/SupportChatProvider'
import Image from 'next/image'

function SupportMainInner() {
  const { tickets, selectedTicketId, selectedTicket, newCount, canTakeOver, canReply, selectTicketId, claimSelectedTicket, sendMessageAsStaff } =
    useSupportChat()
  const [isMobileListOpen, setIsMobileListOpen] = useState(false)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (lastMessageRef.current && selectedTicket) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lastMessageRef, selectedTicket])

  const handleSendMessage = async (content: string) => {
    await sendMessageAsStaff(content)
  }

  const handleSendFile = (file: File) => {
    console.log(file)
  }

  const messages: SupportMessage[] = selectedTicket?.messages || []
  const selectedName = selectedTicket?.requester?.fullName || 'Học viên'
  const hasMessages = messages.length > 0

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
            isMobileListOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileListOpen(false)}
            aria-hidden
          />
        </div>
        <div
          className={cn(
            'absolute inset-y-0 left-0 z-40 w-96 max-w-[90%] border-r border-gray-200 bg-white transform transition-transform duration-300 ease-out',
            isMobileListOpen ? 'translate-x-0' : '-translate-x-full'
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
        />

        <ScrollArea className="flex-1 overflow-auto bg-gray-50/50">
          <div className="p-8 space-y-6">
            {!selectedTicket ? (
              <div className="flex h-[calc(100vh-320px)] items-center justify-center">
                <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <MessagesSquare className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-black text-gray-900">Chọn một ticket để bắt đầu</h3>
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    Danh sách ticket nằm ở cột bên trái.
                  </p>
                </div>
              </div>
            ) : !hasMessages ? (
              <div className="flex h-[calc(100vh-320px)] items-center justify-center">
                <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <MessagesSquare className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-black text-gray-900">Chưa có tin nhắn</h3>
                  <p className="mt-2 text-sm font-medium text-gray-500">
                    Khi học viên gửi tin, nội dung sẽ hiển thị ở đây.
                  </p>
                </div>
              </div>
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

            {hasMessages && messages.map((msg, index) => (
              <div ref={index === messages.length - 1 ? lastMessageRef : null} key={msg._id} className={`flex ${msg.sender.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`flex gap-3 max-w-[70%] ${msg.sender.role === 'user' ? '' : 'flex-row-reverse'}`}>
                  {msg.sender.role === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0 mt-auto mb-1 shadow-sm">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-xs">
                        {selectedName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1">
                    {msg.attachments?.length ? (
                      msg.attachments[0].type === 'image' ? (
                        <div className={`overflow-hidden rounded-2xl shadow-sm border border-gray-100 ${msg.sender.role === 'user' ? 'rounded-bl-none' : 'rounded-br-none'
                          }`}>
                          <Image src={msg.attachments[0].url} alt={msg.attachments[0].name || 'image'} className="max-w-80 h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${msg.sender.role === 'user'
                          ? 'bg-white text-gray-700 rounded-bl-none border-gray-100'
                          : 'bg-indigo-600 text-white rounded-br-none border-indigo-500'
                          }`}>
                          <div className={`p-2 rounded-xl ${msg.sender.role === 'user' ? 'bg-indigo-50 text-indigo-600' : 'bg-white/20 text-white'}`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="font-bold truncate text-[13px]">{msg.attachments[0].name || 'Tệp đính kèm'}</p>
                          </div>
                          <a
                            href={msg.attachments[0].url}
                            target="_blank"
                            rel="noreferrer"
                            className={`p-2 rounded-full transition-colors ${msg.sender.role === 'user' ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-white'
                              }`}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      )
                    ) : (
                      <div className={`p-4 rounded-2xl shadow-sm font-medium leading-relaxed ${msg.sender.role !== 'user'
                        ? 'bg-indigo-600 text-white rounded-br-lg'
                        : 'bg-white text-gray-700 rounded-bl-lg border border-gray-100'
                        }`}>
                        {msg.content}
                      </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-2 ${msg.sender.role !== 'user' ? 'justify-end' : ''}`}>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender.role !== 'user' && <CheckCheck className="w-3 h-3 text-indigo-500" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-gray-200">
          {!canReply && selectedTicket?.status === 'open' && (
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
          <MessageInput onSendMessage={handleSendMessage} onSendFile={handleSendFile} disabled={!canReply} />
        </div>
      </div>
    </div>
  )
}

export function SupportMain() {
  return (
    <SupportChatProvider>
      <SupportMainInner />
    </SupportChatProvider>
  )
}
