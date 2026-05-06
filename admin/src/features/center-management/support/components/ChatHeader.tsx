'use client'

import React from 'react'
import { PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SupportTicket } from '../type'
import { useSocketStore } from '@/hooks/useSocketStore'

interface ChatHeaderProps {
  selectedTicket: SupportTicket | null
  onOpenList?: () => void
}

export function ChatHeader({ selectedTicket, onOpenList }: ChatHeaderProps) {
  const name = selectedTicket?.requester?.fullName || 'Học viên'
  const {onlineUsers} = useSocketStore()
  const isOnline = onlineUsers.includes(selectedTicket?.requester?._id || '')

  return (
    <div className="h-20 px-4 lg:px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {onOpenList && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenList}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="w-11 h-11 shadow-sm">
          <AvatarFallback className="bg-indigo-600 text-white font-black text-lg">
            {name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-black text-gray-900 leading-tight">{name}</h2>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
