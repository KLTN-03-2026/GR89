"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Eye } from "lucide-react"
import Link from "next/link"
import { UserScore } from "@/features/user/types"

interface ActionsCellProps {
  user: UserScore;
}

export default function ActionsCell({ user }: ActionsCellProps) {
  const [openView, setOpenView] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Mở menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/user/${user.userId}/scores`}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenView(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem nhanh
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View Details Dialog */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về điểm số và tiến độ học tập
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold">
                {user.fullName.split(" ").map(word => word.charAt(0)).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.fullName}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">{user.currentLevel}</Badge>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Hoạt động" : "Tạm khóa"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{user.totalPoints}</div>
                <div className="text-sm text-muted-foreground">Tổng điểm</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{user.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Chuỗi hiện tại</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{user.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Chuỗi dài nhất</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{user.totalStudyTime}</div>
                <div className="text-sm text-muted-foreground">Giờ học</div>
              </div>
            </div>

            {/* Skills Breakdown */}
            <div>
              <h4 className="font-semibold mb-3">Điểm theo kỹ năng</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Từ vựng', points: user.vocabularyPoints, color: 'bg-blue-500' },
                  { name: 'Ngữ pháp', points: user.grammarPoints, color: 'bg-green-500' },
                  { name: 'Đọc hiểu', points: user.readingPoints, color: 'bg-yellow-500' },
                  { name: 'Nghe hiểu', points: user.listeningPoints, color: 'bg-purple-500' },
                  { name: 'Nói', points: user.speakingPoints, color: 'bg-pink-500' },
                  { name: 'Viết', points: user.writingPoints, color: 'bg-orange-500' }
                ].map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted"></div>
                      <span className="font-bold">{skill.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpenView(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
