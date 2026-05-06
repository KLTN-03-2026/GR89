'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { SupportTicket } from '../type'

interface ChatListProps {
  tickets: SupportTicket[]
  selectedChatId: string
  onSelectTicket: (ticket: SupportTicket) => void
  newCount: number
  className?: string
  hideOnMobile?: boolean
}

export function ChatList({
  tickets,
  selectedChatId,
  onSelectTicket,
  newCount,
  className,
  hideOnMobile = true,
}: ChatListProps) {
  return (
    <div
      className={cn(
        'lg:border-r border-gray-300 flex flex-col bg-gray-50/30 shrink-0 transition-[width] duration-300',
        hideOnMobile ? 'hidden lg:flex' : 'flex',
        className
      )}
    >
      <div className="p-6 space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">Hỗ trợ học viên</h1>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 font-bold">
            {newCount} mới
          </Badge>
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
          {tickets.map((ticket) => {
            const name = ticket.requester?.fullName || 'Học viên'
            const time = ticket.lastMessageAt
              ? new Date(ticket.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''
            const lastMessage = ticket.lastMessagePreview || ''
            const unread = ticket.unreadCount || 0

            return (
            <div 
              key={ticket._id}
              onClick={() => onSelectTicket(ticket)}
              className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all mb-1 ${
                selectedChatId === ticket._id 
                  ? 'bg-blue-50 shadow-md border-blue-600 shadow-indigo-200/50' 
                  : 'hover:bg-white/50'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className={`font-bold truncate ${unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                    {name}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400">{time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-xs truncate ${unread > 0 ? 'text-indigo-600 font-bold' : 'text-gray-400 font-medium'}`}>
                    {lastMessage}
                  </p>
                  {unread > 0 && (
                    <Badge className="h-5 min-w-5 px-1 bg-indigo-600 flex items-center justify-center rounded-full text-[10px] font-black">
                      {unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
