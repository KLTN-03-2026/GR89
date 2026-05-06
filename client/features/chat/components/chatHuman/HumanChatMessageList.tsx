'use client'

import { forwardRef } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText, Download } from 'lucide-react'
import { ChatMessage } from '@/features/chat/types'
import Image from 'next/image'

interface HumanChatMessageListProps {
  messages: ChatMessage[]
  isTyping?: boolean
}

const HumanChatMessageList = forwardRef<HTMLDivElement, HumanChatMessageListProps>(
  ({ messages, isTyping }, ref) => {
    return (
      <div className="flex flex-col gap-4 p-4">
        {messages.map((msg, index) => (
              <div
            key={msg._id}
            ref={index === messages.length - 1 ? ref : undefined}
            className={`flex ${msg.sender.role === 'admin' || msg.sender.role === 'content' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`flex gap-2 max-w-[85%] ${msg.sender.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {(msg.sender.role === 'admin' || msg.sender.role === 'content') && (
                <Avatar className="h-8 w-8 shrink-0 mt-auto mb-1 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">AD</AvatarFallback>
                </Avatar>
              )}
              <div className="space-y-1">
                {msg.attachments?.length ? (
                  msg.attachments[0].type === 'image' ? (
                    <div
                      className={`overflow-hidden rounded-2xl shadow-sm border border-gray-100 ${
                        msg.sender.role === 'admin' || msg.sender.role === 'content'
                          ? 'rounded-bl-none'
                          : 'rounded-br-none'
                      }`}
                    >
                      <Image
                        src={msg.attachments[0].url}
                        alt={msg.attachments[0].name || 'image'}
                        className="max-w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-3 p-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                        msg.sender.role === 'admin' || msg.sender.role === 'content'
                          ? 'bg-white text-gray-700 rounded-bl-none border-gray-100'
                          : 'bg-indigo-600 text-white rounded-br-none border-indigo-500'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${
                          msg.sender.role === 'admin' || msg.sender.role === 'content'
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <p className="font-bold truncate text-[13px]">
                          {msg.attachments[0].name || 'Tệp đính kèm'}
                        </p>
                      </div>
                      <a
                        href={msg.attachments[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-2 rounded-full transition-colors ${
                          msg.sender.role === 'admin' || msg.sender.role === 'content'
                            ? 'hover:bg-gray-100 text-gray-400'
                            : 'hover:bg-white/10 text-white'
                        }`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  )
                ) : (
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender.role === 'admin' || msg.sender.role === 'content' 
                      ? 'bg-white text-gray-700 rounded-bl-none border border-gray-100' 
                      : 'bg-indigo-600 text-white rounded-br-none'
                  }`}>
                    {msg.content}
                  </div>
                )}
                <div className={`flex items-center gap-1.5 px-1 ${msg.sender.role === 'user' ? 'justify-end' : ''}`}>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Đang trả lời...</span>
            </div>
          </div>
        )}
      </div>
    )
  }
)

HumanChatMessageList.displayName = 'HumanChatMessageList'

export default HumanChatMessageList
