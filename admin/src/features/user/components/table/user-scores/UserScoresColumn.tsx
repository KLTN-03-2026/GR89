"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ActionsCell from "./ActionsCell"
import { TrendingUp, Clock } from "lucide-react"
import { formatScore } from "@/lib/scoreUtils"
import { UserScore } from "@/features/user/types"
import { formatStudyTime } from "@/lib/utils"

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const columnsUserScores = (): ColumnDef<UserScore>[] => [
  {
    id: "searchable",
    accessorFn: (row) => `${row.fullName} ${row.email}`,
    enableHiding: true,
    enableSorting: false,
  },
  {
    id: "stt",
    header: () => <div className="text-center">STT</div>,
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.index + 1}</div>
    },
    enableSorting: false,
  },
  {
    accessorKey: "user",
    header: () => <div className="text-center">Người dùng</div>,
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 line-clamp-2">
            <div className="font-medium ">{user.fullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      )
    }
  },


  {
    accessorKey: "totalPoints",
    header: () => <div className="text-center">Tổng điểm</div>,
    cell: ({ row }) => {
      const points = row.original.totalPoints
      return (
        <div className="text-center line-clamp-2">
          <div className="font-bold text-lg">{formatScore(points)}</div>
          <div className="text-sm text-muted-foreground">điểm</div>
        </div>
      )
    }
  },

  {
    id: "skills",
    header: () => <div className="text-center">Kỹ năng</div>,
    cell: ({ row }) => {
      const user = row.original
      const skills = [
        { name: 'IPA', points: user.ipaPoints },
        { name: 'Vocab', points: user.vocabularyPoints },
        { name: 'Gram', points: user.grammarPoints },
        { name: 'Read', points: user.readingPoints },
        { name: 'Listen', points: user.listeningPoints },
        { name: 'Speak', points: user.speakingPoints },
        { name: 'Write', points: user.writingPoints }
      ]

      return (
        <div className="grid grid-cols-4 gap-2 text-center">
          {skills.map((skill, index) => (
            <div key={index}>
              <div className="text-xs font-medium">{skill.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatScore(skill.points)}
              </div>
            </div>
          ))}
        </div>
      )
    }
  },

  {
    accessorKey: "currentStreak",
    header: () => <div className="text-center">Chuỗi học</div>,
    cell: ({ row }) => {
      const streak = row.original.currentStreak
      return (
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <div className="text-center">
            <div className="font-medium">{streak}</div>
            <div className="text-xs text-muted-foreground">ngày</div>
          </div>
        </div>
      )
    }
  },

  {
    accessorKey: "totalStudyTime",
    header: () => <div className="text-center">Thời gian học</div>,
    cell: ({ row }) => {
      const time = row.original.totalStudyTime
      return (
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div className="text-center">
            <div className="font-medium">{formatStudyTime(time)}</div>
          </div>
        </div>
      )
    }
  },

  {
    accessorKey: "lastActiveDate",
    header: () => <div className="text-center">Hoạt động cuối</div>,
    cell: ({ row }) => {
      const lastActiveDate = row.original.lastActiveDate

      // Kiểm tra nếu không có lastActiveDate hoặc giá trị không hợp lệ
      if (!lastActiveDate) {
        return (
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Chưa có</div>
          </div>
        )
      }

      const date = new Date(lastActiveDate)

      // Kiểm tra nếu ngày không hợp lệ (NaN hoặc năm 1970)
      if (isNaN(date.getTime()) || date.getFullYear() < 2000) {
        return (
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Chưa có</div>
          </div>
        )
      }

      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      return (
        <div className="text-center">
          <div className="text-sm">
            {diffDays === 0 ? 'Hôm nay' :
              diffDays === 1 ? 'Hôm qua' :
                diffDays < 0 ? 'Trong tương lai' :
                  `${diffDays} ngày trước`}
          </div>
          <div className="text-xs text-muted-foreground">
            {date.toLocaleDateString('vi-VN')}
          </div>
        </div>
      )
    }
  },

  {
    accessorKey: "isActive",
    header: () => <div className="text-center">Trạng thái</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Hoạt động" : "Tạm khóa"}
        </Badge>
      </div>
    )
  },

  {
    id: "actions",
    cell: ({ row }) => <ActionsCell user={row.original} />
  },
]
