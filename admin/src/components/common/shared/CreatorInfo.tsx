'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User } from "@/features/user/types"
import { User as UserIcon, Clock, Edit } from "lucide-react"

interface CreatorInfoProps {
  createdBy: {
    _id: string
    fullName: string
    email: string
  }
  updatedBy?: {
    _id: string
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt: string
  showAvatar?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

export function CreatorInfo({
  createdBy,
  updatedBy,
  createdAt,
  updatedAt,
  showAvatar = true,
  variant = 'default',
  className = ''
}: CreatorInfoProps) {
  // Validation để tránh lỗi khi createdBy undefined
  if (!createdBy) {
    return <div className="text-muted-foreground">-</div>
  }
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return '??'
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        {showAvatar && (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {getInitials(createdBy.fullName)}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="font-medium">{createdBy.fullName}</span>
        <span>•</span>
        <span>{formatDate(createdAt)}</span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Người tạo */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {getInitials(createdBy.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{createdBy.fullName}</span>
              <Badge variant="secondary" className="text-xs">
                Tạo bởi
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{createdBy.email}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Người cập nhật */}
        {updatedBy && (
          <div className="flex items-center gap-3 pl-2 border-l-2 border-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm">
                {getInitials(updatedBy.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{updatedBy.fullName}</span>
                <Badge variant="outline" className="text-xs">
                  Cập nhật bởi
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDate(updatedAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-sm">
            {getInitials(createdBy.fullName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{createdBy.fullName}</span>
          {updatedBy && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">Cập nhật bởi {updatedBy.fullName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(createdAt)}</span>
          {updatedBy && updatedAt !== createdAt && (
            <>
              <span>•</span>
              <span>Cập nhật: {formatDate(updatedAt)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Component nhỏ gọn cho table cells
export function CreatorBadge({ createdBy }: { createdBy: User }) {
  // Validation để tránh lỗi khi createdBy undefined
  if (!createdBy) {
    return <div className="text-muted-foreground">-</div>
  }

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return '??'
    }
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarFallback className="text-xs">
          {getInitials(createdBy.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{createdBy.fullName}</span>
        {/* <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span> */}
      </div>
    </div>
  )
}
