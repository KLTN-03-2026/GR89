'use client'

import React from 'react'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCheck, Download, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SupportMessage } from '../type'

export function SupportMessageRow({
  msg,
  studentName,
  isLast,
  lastMessageRef,
}: {
  msg: SupportMessage
  studentName: string
  isLast: boolean
  lastMessageRef: React.RefObject<HTMLDivElement | null>
}) {
  const isUser = msg.sender.role === 'user'
  const displayName = msg.sender.fullName || (isUser ? studentName : 'Giáo viên')
  const avatarUrl = msg.sender.avatar || ''
  const avatarInitial = (displayName || '?').charAt(0).toUpperCase()

  return (
    <div ref={isLast ? lastMessageRef : null} className={cn('flex', isUser ? 'justify-start' : 'justify-end')}>
      <div className={cn('flex gap-3 max-w-[70%]', isUser ? '' : 'flex-row-reverse')}>
        <Avatar className={cn('w-8 h-8 shrink-0 mt-auto mb-1 shadow-sm', isUser ? '' : 'border border-indigo-100')}>
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
          <AvatarFallback
            className={cn(
              isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-600 text-white',
              'font-bold text-xs',
            )}
          >
            {avatarInitial}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          {!isUser ? (
            <div className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
              {displayName}
            </div>
          ) : null}

          {msg.attachments?.length ? (
            msg.attachments[0].type === 'image' ? (
              <div
                className={cn(
                  'overflow-hidden rounded-2xl shadow-sm border border-gray-100',
                  isUser ? 'rounded-bl-none' : 'rounded-br-none',
                )}
              >
                <Image
                  src={msg.attachments[0].url}
                  alt={msg.attachments[0].name || 'image'}
                  width={360}
                  height={240}
                  className="max-w-80 h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              </div>
            ) : (
              <div
                className={cn(
                  'flex items-center gap-3 p-3 rounded-2xl text-sm leading-relaxed shadow-sm border',
                  isUser
                    ? 'bg-white text-gray-700 rounded-bl-none border-gray-100'
                    : 'bg-indigo-600 text-white rounded-br-none border-indigo-500',
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-xl',
                    isUser ? 'bg-indigo-50 text-indigo-600' : 'bg-white/20 text-white',
                  )}
                >
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-bold truncate text-[13px]">{msg.attachments[0].name || 'Tệp đính kèm'}</p>
                </div>
                <a
                  href={msg.attachments[0].url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    isUser ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-white',
                  )}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            )
          ) : (
            <div
              className={cn(
                'p-4 rounded-2xl shadow-sm font-medium leading-relaxed',
                !isUser ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-white text-gray-700 rounded-bl-lg border border-gray-100',
              )}
            >
              {msg.content}
            </div>
          )}

          <div className={cn('flex items-center gap-1.5 px-2', !isUser ? 'justify-end' : '')}>
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser ? <CheckCheck className="w-3 h-3 text-indigo-500" /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

