'use client'

import { useEffect, useRef, useState } from 'react'
import HumanChatHeader from './HumanChatHeader'
import HumanChatMessageList from './HumanChatMessageList'
import HumanChatInput from './HumanChatInput'
import HumanChatMinimized from './HumanChatMinimized'
import { useChat } from '../../context/ChatProvider'
import { ScrollArea } from '@/components/ui/scroll-area'

interface HumanChatWindowProps {
  onClose: () => void
  setOpenChat: (chat: 'human' | null) => void
}

export default function HumanChatWindow({ onClose, setOpenChat }: HumanChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { openChat } = useChat()

  // Mock messages
  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      senderId: 'admin',
      content: 'Chào bạn! Tôi có thể hỗ trợ gì cho lộ trình học của bạn hôm nay?',
      time: '10:00',
      status: 'seen'
    }
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }
    setMessages([...messages, newMessage])
    setInput('')

    // Mock auto-reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        senderId: 'admin',
        content: 'Cảm ơn bạn đã phản hồi. Đội ngũ hỗ trợ sẽ trả lời bạn trong ít phút.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'seen'
      }])
    }, 2000)
  }

  const handleSendFile = (file: File) => {
    const isImage = file.type.startsWith('image/')
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'user',
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

  if (isMinimized) {
    return <HumanChatMinimized
      onExpand={() => { setIsMinimized(false); setOpenChat('human') }}
      onClose={() => { setIsMinimized(false); onClose() }}
    />
  }

  return (
    <div className={`fixed bottom-4 right-6 z-[2000] flex h-[600px] w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900 animate-in slide-in-from-bottom-4 duration-300 ${openChat === 'human' ? 'flex' : 'hidden'}`}>
      <HumanChatHeader onMinimize={() => setIsMinimized(true)} onClose={onClose} />

      <div className="flex-shrink-0 border-b border-indigo-50 bg-indigo-50/30 px-4 py-2 text-[11px] text-indigo-700 font-bold dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300">
        📢 Đội ngũ hỗ trợ đang trực tuyến (Thời gian phản hồi ~5p)
      </div>

      <ScrollArea className="flex-1 overflow-auto bg-gray-50/30">
        <HumanChatMessageList ref={messagesEndRef} messages={messages} />
      </ScrollArea>

      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-1.5 text-[10px] text-gray-400 font-medium dark:border-gray-800 dark:bg-gray-900">
        Bằng cách bắt đầu chat, bạn đồng ý với điều khoản hỗ trợ của chúng tôi.
      </div>

      <HumanChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onSendFile={handleSendFile}
      />
    </div>
  )
}
