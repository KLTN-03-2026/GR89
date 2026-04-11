"use client"

import { LogOut, UserCircle, MoreVertical, Bell, Crown } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/libs/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function NavUser() {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const { logout, user, isLoading } = useAuth()

  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar?.url])

  const handleLogout = async () => {
    await logout()
  }

  const defaultAvatar = user?.avatar?.url || "/images/avatar-default.jpg"

  if (isLoading || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">--</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale bg-gray-400">
                <AvatarImage src={
                  avatarError ? defaultAvatar : (user?.avatar?.url || defaultAvatar)}
                  alt={user.fullName}
                  onError={() => setAvatarError(true)}
                />
                <AvatarFallback className="rounded-lg">
                  {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{user.fullName}</span>
                  {user.isVip && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                      <Crown className="w-2.5 h-2.5" />
                      VIP
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <MoreVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) bg-white min-w-56 rounded-lg border-gray-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg bg-gray-400">
                  <AvatarImage src={
                    avatarError ? defaultAvatar : (user?.avatar?.url || defaultAvatar)}
                    alt={user.fullName}
                    onError={() => setAvatarError(true)}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{user.fullName}</span>
                    {user.isVip && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                        <Crown className="w-2.5 h-2.5" />
                        VIP
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/account')} >
                <UserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/notifications')} >
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}