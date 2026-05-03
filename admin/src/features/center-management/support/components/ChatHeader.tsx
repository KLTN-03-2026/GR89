'use client'

import React from 'react'
import { Phone, Video, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { IChatItem } from '../type'

interface ChatHeaderProps {
  selectedChat: IChatItem
}

export function ChatHeader({ selectedChat }: ChatHeaderProps) {
  return (
    <div className="h-20 px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <Avatar className="w-11 h-11 shadow-sm">
          <AvatarFallback className="bg-indigo-600 text-white font-black text-lg">
            {selectedChat.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-black text-gray-900 leading-tight">{selectedChat.name}</h2>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${selectedChat.online ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {selectedChat.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
          <Video className="w-5 h-5" />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Button variant="ghost" size="icon" className="rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
