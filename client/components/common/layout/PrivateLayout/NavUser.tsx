"use client"

import {
  LogOut,
  UserCircle,
  MoreVertical,
  Bell,
  Crown
} from "lucide-react"

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
  }, [user?.avatar])

  const defaultAvatar = user?.avatar || "/images/avatar-default.jpg"

  const isVipActive = user?.vipExpireDate && new Date((user.vipExpireDate || new Date())) > new Date()

  const VipBadge = () => (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-md">
      <Crown className="w-3 h-3" />
      VIP
    </span>
  )

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback>--</AvatarFallback>
            </Avatar>
            <span className="text-sm">Loading...</span>
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
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg bg-gray-300">
                <AvatarImage
                  src={avatarError ? defaultAvatar : defaultAvatar}
                  alt={user.fullName}
                  onError={() => setAvatarError(true)}
                />
                <AvatarFallback>
                  {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">
                    {user.fullName}
                  </span>

                  {isVipActive && <VipBadge />}
                </div>

                <span className="text-xs text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>

              <MoreVertical className="ml-auto w-4 h-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-56 bg-white rounded-lg border shadow-md"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >

            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={defaultAvatar} />
                  <AvatarFallback>
                    {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.fullName}</span>
                    {isVipActive && <VipBadge />}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/account")}>
                <UserCircle />
                Account
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/notifications")}>
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