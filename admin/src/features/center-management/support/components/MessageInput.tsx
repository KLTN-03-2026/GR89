'use client'

import React, { useState, useRef } from 'react'
import { Paperclip, Image as ImageIcon, Smile, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface MessageInputProps {
  onSendMessage: (message: string) => void
  onSendFile: (file: File) => void
}

export function MessageInput({ onSendMessage, onSendFile }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSendFile(file)
      if (e.target) e.target.value = ''
    }
  }

  return (
    <div className="p-6 border-t border-gray-100 shrink-0">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <input type="file" ref={imageInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      
      <div className="flex items-center gap-4 bg-gray-50 p-2 pl-4 rounded-[2rem] border border-gray-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-9 h-9 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-9 h-9 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
            <Smile className="w-5 h-5" />
          </Button>
        </div>
        <Input 
          placeholder="Nhập tin nhắn trả lời..." 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="border-none bg-transparent focus-visible:ring-0 font-bold h-11"
        />
        <Button 
          onClick={handleSend}
          className={`w-11 h-11 rounded-full p-0 transition-all ${
            message.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' : 'bg-gray-200'
          }`}
          disabled={!message.trim()}
        >
          <Send className={`w-5 h-5 ${message.trim() ? 'text-white' : 'text-gray-400'}`} />
        </Button>
      </div>
    </div>
  )
}
