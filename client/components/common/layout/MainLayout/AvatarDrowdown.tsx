'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/libs/contexts/AuthContext'
import { Bell, LogOut, UserCircle, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AvatarDrowdown() {
  const { user, logout } = useAuth()
  const defaultAvatar = user?.avatar || "/images/avatar-default.jpg"
  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-10 h-10 cursor-pointer bg-gray-400">
          <AvatarImage src={avatarError ? defaultAvatar : (user?.avatar || defaultAvatar)} alt="avatar" width={40} height={40} onError={() => setAvatarError(true)} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white shadow-md border-gray-200 mt-1">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg bg-gray-400">
              <AvatarImage
                src={avatarError ? defaultAvatar : (user?.avatar || defaultAvatar)}
                alt={user?.fullName}
                onError={() => setAvatarError(true)}
              />
              <AvatarFallback className="rounded-lg">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{user?.fullName}</span>
                {user?.isVip && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                    <Crown className="w-2.5 h-2.5" />
                    VIP
                  </span>
                )}
              </div>
              <span className="text-muted-foreground truncate text-xs">
                {user?.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserCircle />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
