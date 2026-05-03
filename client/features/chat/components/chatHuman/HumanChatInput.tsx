'use client'

import { KeyboardEvent, useRef } from 'react'
import { Send, Paperclip, Smile, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HumanChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onSendFile: (file: File) => void
  disabled?: boolean
}

export default function HumanChatInput({ value, onChange, onSend, onSendFile, disabled = false }: HumanChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault()
      onSend()
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
    <div className="border-t border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-gray-400 hover:text-indigo-600 rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-gray-400 hover:text-indigo-600 rounded-full"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Đang kết nối..." : "Nhập tin nhắn..."}
          disabled={disabled}
          className="flex-1 rounded-2xl border-none bg-gray-50 px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100"
        />
        <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-indigo-600 rounded-full">
          <Smile className="h-5 w-5" />
        </Button>
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className={`h-9 w-9 rounded-full p-0 text-white transition-all ${
            value.trim() ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-200'
          }`}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
