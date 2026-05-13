"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, Settings, LogOut, User, CheckCircle2, Circle, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useNotification } from "@/context/NotificationProvider"

export function Header() {
  const { logout, user } = useAuth()
  const router = useRouter()
  const { items, unreadCount, markRead } = useNotification()

  const handleLogout = async () => {
    await logout()
  }

  const formatTime = (iso: string) => {
    const t = new Date(iso).getTime()
    if (!Number.isFinite(t)) return ''
    const diff = Date.now() - t
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'Vừa xong'
    if (min < 60) return `${min} phút trước`
    const hour = Math.floor(min / 60)
    if (hour < 24) return `${hour} giờ trước`
    const day = Math.floor(hour / 24)
    return `${day} ngày trước`
  }

  const iconFor = (type: string) => {
     if (type === "payment") return <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
      if (type === "support") return <Circle className="w-4 h-4 text-blue-500 mt-0.5" />
      if (type === "homework") return <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
      return <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
  }

  return (
    <header className="flex items-center justify-between p-5 border-b border-gray-200 w-full">
      <SidebarTrigger />

      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Tìm kiếm..." className="pl-8 w-full" />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4 space-x-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
              <div className="px-4 py-2 border-b text-sm font-medium">Thông báo</div>
              <div className="max-h-80 overflow-auto divide-y">
                {items.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500 text-center">Chưa có thông báo</div>
                ) : (
                  items.map((n) => (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer ${!n.isRead ? "bg-blue-50/30" : ""}`}
                      onClick={async () => {
                        if (!n.isRead) await markRead(n._id)
                        if (n.link) router.push(n.link)
                      }}
                    >
                      {iconFor(n.type)}
                      <div className="flex-1">
                        <div className="text-sm">{n.title}</div>
                        <div className="text-[11px] text-gray-500">{formatTime(n.createdAt)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-2 text-center text-sm">
                <a href="/communications/history" className="text-blue-600 hover:underline">Xem tất cả</a>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar || ""} alt="Admin" />
                  <AvatarFallback className="bg-gray-200">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
