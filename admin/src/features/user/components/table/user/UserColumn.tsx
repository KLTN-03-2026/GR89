"use client"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { User } from "@/features/user/types"
import { Role } from "@/features/role/types"
import ActionsCell from "./ActionsCell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield } from "lucide-react"

// Mock roles data - replace with real API
const mockRoles: Record<string, Role> = {
  "admin": { _id: "admin", name: "Quản trị viên", description: "Quản trị viên", permissions: ["all"] },
  "user": { _id: "user", name: "Học viên", description: "Học viên", permissions: ["read"] },
  "content": { _id: "content", name: "Quản lý nội dung", description: "Quản lý nội dung", permissions: ["content:read", "content:write", "content:delete"] },
}

function getRoleInfo(role: string) {
  return mockRoles[role] || { name: "Unknown", description: "Không xác định" }
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export const columnsUser = (): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "stt",
    header: () => <div className="text-center">STT</div>,
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.index + 1}</div>
    },
    enableSorting: false,
  },

  // Hidden column for search functionality
  {
    id: "searchable",
    accessorFn: (row) => `${row.fullName} ${row.email}`,
    enableHiding: true,
    enableSorting: false,
  },

  {
    accessorKey: "user",
    header: () => <div className="text-center">Học viên</div>,
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar?.url || '/images/avatar-default.jpg'} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-medium">{user.fullName}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      )
    }
  },

  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.email}</div>
    )
  },

  {
    accessorKey: "role",
    header: () => <div className="text-center">Vai trò</div>,
    cell: ({ row }) => {
      const role = getRoleInfo(row.original.role)
      return (
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <Badge variant={
            role.name === "Quản trị viên" ? "destructive" :
              role.name === "Quản lý nội dung" ? "default" :
                "secondary"
          }>
            {role.name}
          </Badge>
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
