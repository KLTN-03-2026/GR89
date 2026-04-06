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

export function Header() {
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout()
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
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">3</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 p-0" align="end" sideOffset={8}>
              <div className="px-4 py-2 border-b text-sm font-medium">Thông báo</div>
              <div className="max-h-80 overflow-auto divide-y">
                {/* Mock notifications */}
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50">
                  <Circle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm">Học viên Nguyen An đã tạo ticket mới ở Reading</div>
                    <div className="text-[11px] text-gray-500">2 phút trước</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm">Ticket #234 đã được giải quyết</div>
                    <div className="text-[11px] text-gray-500">30 phút trước</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm">Ticket #211 sắp quá SLA</div>
                    <div className="text-[11px] text-gray-500">1 giờ trước</div>
                  </div>
                </div>
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
