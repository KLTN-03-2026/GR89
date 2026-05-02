'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CheckCheck, FileText, Download } from 'lucide-react'
import { IChatItem, IMessage } from './type'
import { ChatList } from './components/ChatList'
import { ChatHeader } from './components/ChatHeader'
import { MessageInput } from './components/MessageInput'

// Mock Data
const CHAT_LIST: IChatItem[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    lastMessage: 'Em cần hỗ trợ bài tập Writing Task 1 ạ',
    time: '10:30',
    unread: 2,
    online: true,
    avatar: ''
  },
  {
    id: '2',
    name: 'Trần Thị B',
    lastMessage: 'Cảm ơn thầy/cô nhiều ạ!',
    time: '09:15',
    unread: 0,
    online: false,
    avatar: ''
  },
  {
    id: '3',
    name: 'Lê Văn C',
    lastMessage: 'Lịch học ngày mai có thay đổi gì không ạ?',
    time: 'Hôm qua',
    unread: 0,
    online: true,
    avatar: ''
  }
]

const MOCK_MESSAGES: IMessage[] = [
  {
    id: 'm1',
    senderId: 'user',
    content: 'Chào thầy, em có câu hỏi về bài tập Writing hôm qua ạ.',
    time: '10:25',
    status: 'seen'
  },
  {
    id: 'm2',
    senderId: 'admin',
    content: 'Chào em, thầy nghe đây. Em gặp khó khăn ở phần nào?',
    time: '10:26',
    status: 'seen'
  },
  {
    id: 'm3',
    senderId: 'user',
    content: 'Phần mô tả biểu đồ tròn em chưa biết cách dùng từ nối sao cho tự nhiên ạ.',
    time: '10:28',
    status: 'seen'
  },
  {
    id: 'm4',
    senderId: 'user',
    content: 'Em cần hỗ trợ bài tập Writing Task 1 ạ',
    time: '10:30',
    status: 'sent'
  }
]

export function SupportMain() {
  const [selectedChat, setSelectedChat] = useState<IChatItem>(CHAT_LIST[0])
  const [messages, setMessages] = useState<IMessage[]>(MOCK_MESSAGES)

  const handleSendMessage = (content: string) => {
    const newMessage: IMessage = {
      id: Date.now().toString(),
      senderId: 'admin',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }
    setMessages([...messages, newMessage])
  }

  const handleSendFile = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const newMessage: IMessage = {
      id: Date.now().toString(),
      senderId: 'admin',
      content: '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: isImage ? 'image' : 'file',
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(1) + ' KB',
      fileUrl: isImage ? URL.createObjectURL(file) : '#'
    }
    setMessages([...messages, newMessage])
  }

  return (
    <div className="flex h-[calc(100vh-110px)] bg-white rounded-3xl overflow-hidden">
      <ChatList
        chats={CHAT_LIST}
        selectedChatId={selectedChat.id}
        onSelectChat={setSelectedChat}
      />

      <div className="flex-1 flex flex-col bg-white">
        <ChatHeader selectedChat={selectedChat} />

        <ScrollArea className="flex-1 overflow-auto bg-gray-50/50">
          <div className="p-8 space-y-6">
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-white text-gray-400 font-bold py-1 px-4 rounded-full shadow-sm border-gray-100 uppercase tracking-widest text-[10px]">
                Hôm nay, 20/05/2024
              </Badge>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[70%] ${msg.senderId === 'admin' ? 'flex-row-reverse' : ''}`}>
                  {msg.senderId === 'user' && (
                    <Avatar className="w-8 h-8 shrink-0 mt-auto mb-1 shadow-sm">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-xs">
                        {selectedChat.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="space-y-1">
                    {msg.type === 'image' ? (
                      <div className={`overflow-hidden rounded-2xl shadow-sm border border-gray-100 ${msg.senderId === 'admin' ? 'rounded-br-none' : 'rounded-bl-none'
                        }`}>
                        <img src={msg.fileUrl} alt="Sent image" className="max-w-[300px] h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity" />
                      </div>
                    ) : msg.type === 'file' ? (
                      <div className={`flex items-center gap-3 p-3 rounded-2xl text-sm leading-relaxed shadow-sm border ${msg.senderId === 'admin'
                        ? 'bg-indigo-600 text-white rounded-br-none border-indigo-500'
                        : 'bg-white text-gray-700 rounded-bl-none border-gray-100'
                        }`}>
                        <div className={`p-2 rounded-xl ${msg.senderId === 'admin' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold truncate text-[13px]">{msg.fileName}</p>
                          <p className={`text-[10px] font-medium ${msg.senderId === 'admin' ? 'text-indigo-100' : 'text-gray-400'}`}>{msg.fileSize}</p>
                        </div>
                        <button className={`p-2 rounded-full transition-colors ${msg.senderId === 'admin' ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-400'
                          }`}>
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className={`p-4 rounded-[2rem] shadow-sm font-medium leading-relaxed ${msg.senderId === 'admin'
                        ? 'bg-indigo-600 text-white rounded-br-lg'
                        : 'bg-white text-gray-700 rounded-bl-lg border border-gray-100'
                        }`}>
                        {msg.content}
                      </div>
                    )}
                    <div className={`flex items-center gap-1.5 px-2 ${msg.senderId === 'admin' ? 'justify-end' : ''}`}>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{msg.time}</span>
                      {msg.senderId === 'admin' && (
                        <CheckCheck className={`w-3 h-3 ${msg.status === 'seen' ? 'text-indigo-500' : 'text-gray-300'}`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <MessageInput onSendMessage={handleSendMessage} onSendFile={handleSendFile} />
      </div>
    </div>
  )
}
