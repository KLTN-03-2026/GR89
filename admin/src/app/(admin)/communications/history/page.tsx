import { NotificationHistoryMain } from "@/features/notification"
import { getAdminNotificationsServer } from "@/features/notification/services/serverApi"

interface PageProps {
  searchParams: Promise<{
    page?: string
    limit?: string
    unread?: string
  }>
}

export default async function page({ searchParams }: PageProps) {
  const { page = "1", limit = "20", unread } = await searchParams

  const res = await getAdminNotificationsServer({
    page: Math.max(1, Number(page) || 1),
    limit: [10, 20, 50].includes(Number(limit)) ? Number(limit) : 20,
    unread: unread === "true",
  })

  return (
    <NotificationHistoryMain initialData={res.data} pagination={res.pagination} />
  )
}
