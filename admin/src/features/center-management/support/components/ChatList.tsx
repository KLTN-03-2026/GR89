'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { IChatItem } from '../type'

interface ChatListProps {
  chats: IChatItem[]
  selectedChatId: string
  onSelectChat: (chat: IChatItem) => void
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <div className="w-[350px] border-r border-gray-100 flex flex-col bg-gray-50/30 shrink-0">
      <div className="p-6 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">Hỗ trợ học viên</h1>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-bold">3 mới</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm tin nhắn..." 
            className="pl-10 rounded-2xl border-none bg-white shadow-sm font-medium h-11"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="px-2 pb-6">
          {chats.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all mb-1 ${
                selectedChatId === chat.id 
                  ? 'bg-white shadow-md shadow-indigo-100/50' 
                  : 'hover:bg-white/50'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={`font-bold truncate ${chat.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                    {chat.name}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400">{chat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate ${chat.unread > 0 ? 'text-indigo-600 font-bold' : 'text-gray-400 font-medium'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <Badge className="h-5 min-w-[20px] px-1 bg-indigo-600 flex items-center justify-center rounded-full text-[10px] font-black">
                      {chat.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
