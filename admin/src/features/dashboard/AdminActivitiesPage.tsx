'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAdminActivities, AdminActivityItem } from '@/lib/apis/api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Activity, Search, RefreshCw } from 'lucide-react'

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<AdminActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false
  })

  const fetchActivities = async (targetPage: number, searchValue: string) => {
    setLoading(true)
    try {
      const response = await getAdminActivities({
        page: targetPage,
        limit: 20,
        search: searchValue || undefined
      })
      if (response.success) {
        setActivities(response.data || [])
        setPagination({
          page: response.pagination?.page || 1,
          limit: response.pagination?.limit || 20,
          total: response.pagination?.total || 0,
          pages: response.pagination?.pages || 1,
          hasNext: response.pagination?.hasNext || false,
          hasPrev: response.pagination?.hasPrev || false
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities(page, search)
  }, [page])

  const onSearch = () => {
    setPage(1)
    fetchActivities(1, search)
  }

  return (
    <div className="p-8 space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Activity className="w-5 h-5 text-indigo-600" />
            </div>
            <CardTitle>Lịch sử hoạt động quản trị</CardTitle>
          </div>
          <Button variant="outline" onClick={() => fetchActivities(page, search)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mô tả, action, resource..."
            />
            <Button onClick={onSearch}>
              <Search className="w-4 h-4 mr-2" />
              Tìm
            </Button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 py-8">Đang tải hoạt động...</div>
          ) : activities.length === 0 ? (
            <div className="text-sm text-gray-500 py-8">Chưa có dữ liệu hoạt động.</div>
          ) : (
            <div className="space-y-3">
              {activities.map((item) => (
                <div key={item._id} className="p-4 border border-gray-100 rounded-xl bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.adminId?.fullName || 'Admin'} · {item.resourceType} · {item.action}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.adminRole}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-gray-500">
              Tổng: {pagination.total} hoạt động
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Trước
              </Button>
              <span className="text-sm text-gray-600">Trang {pagination.page}/{pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

