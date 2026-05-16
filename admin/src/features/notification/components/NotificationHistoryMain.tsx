'use client'

import { DataTable } from "@/components/common"
import { AdminPageHeader } from "@/components/common/shared/AdminPageHeader"
import { AdminPageShell } from "@/components/common/shared/AdminPageShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNotification } from "@/context/NotificationProvider"
import { ColumnDef } from "@tanstack/react-table"
import { Bell, CheckCircle2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import type { AdminNotification, NotificationPagination } from "../types"

function formatTime(iso: string) {
  const t = new Date(iso).getTime()
  if (!Number.isFinite(t)) return ""
  const diff = Date.now() - t
  const min = Math.floor(diff / 60000)
  if (min < 1) return "Vừa xong"
  if (min < 60) return `${min} phút trước`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} giờ trước`
  const day = Math.floor(hour / 24)
  return `${day} ngày trước`
}

export function NotificationHistoryMain({
  initialData,
  pagination,
}: {
  initialData: AdminNotification[]
  pagination: NotificationPagination
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { markRead, markAllRead } = useNotification()

  const urlPage = Math.max(1, Number(searchParams.get("page")) || 1)
  const urlLimit = [10, 20, 50].includes(Number(searchParams.get("limit"))) ? Number(searchParams.get("limit")) : 20
  const urlUnread = searchParams.get("unread") === "true"

  const [items, setItems] = useState<AdminNotification[]>(initialData)

  useEffect(() => {
    setItems(initialData)
  }, [initialData])

  const updateUrl = (updates: Record<string, string | number | boolean | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === false) {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const columns = useMemo<ColumnDef<AdminNotification>[]>(() => {
    return [
      {
        accessorKey: "title",
        header: "Thông báo",
        cell: ({ row }) => {
          const n = row.original
          return (
            <div className="space-y-1">
              <button
                type="button"
                className={`text-left font-semibold hover:underline ${!n.isRead ? "text-blue-700" : ""}`}
                onClick={async () => {
                  if (!n.isRead) await markRead(n._id)
                  if (n.link) router.push(n.link)
                }}
              >
                {n.title}
              </button>
              {n.body ? <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div> : null}
            </div>
          )
        },
      },
      {
        accessorKey: "type",
        header: "Loại",
        cell: ({ row }) => {
          const t = row.original.type || "system"
          return <Badge variant="secondary">{t}</Badge>
        },
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge variant={row.original.isRead ? "secondary" : "default"}>
            {row.original.isRead ? "Đã đọc" : "Chưa đọc"}
          </Badge>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Thời gian",
        cell: ({ row }) => <div className="text-sm text-muted-foreground">{formatTime(row.original.createdAt)}</div>,
      },
    ]
  }, [markRead, router])

  return (
    <AdminPageShell>
      <div className="space-y-6">
        <AdminPageHeader
          title="Lịch sử thông báo"
          subtitle="Tất cả thông báo gửi cho tài khoản quản trị"
          icon={Bell}
          actions={
            <>
              <Button
                variant={urlUnread ? "default" : "outline"}
                onClick={() => updateUrl({ unread: urlUnread ? undefined : true, page: 1 })}
              >
                {urlUnread ? "Đang lọc: Chưa đọc" : "Chỉ xem chưa đọc"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await markAllRead()
                  router.refresh()
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Đánh dấu tất cả đã đọc
              </Button>
            </>
          }
        />

        <DataTable
          columns={columns}
          data={items}
          columnNameSearch="title"
          serverSidePagination
          pagination={{
            page: urlPage,
            limit: urlLimit,
            total: pagination.total,
            pages: pagination.pages,
          }}
          onPageChange={(p) => updateUrl({ page: p })}
          onLimitChange={(l) => updateUrl({ limit: l, page: 1 })}
        />
      </div>
    </AdminPageShell>
  )
}
