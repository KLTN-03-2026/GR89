'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getDashboardReport, type DashboardReportResponse, type ReportQueryParams } from '@/lib/apis/api'
import { PageHeader } from '@/components/common/shared/PageHeader'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Users, BookOpen, Video, DollarSign, RefreshCcw, Loader2 } from 'lucide-react'

type CategoryFilter = NonNullable<ReportQueryParams['category']>

const getDefaultDates = () => {
  const end = new Date()
  const start = new Date(end.getTime() - 1000 * 60 * 60 * 24 * 29)
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  }
}

export default function Page() {
  const defaultDates = useMemo(() => getDefaultDates(), [])
  const [startDate, setStartDate] = useState(defaultDates.startDate)
  const [endDate, setEndDate] = useState(defaultDates.endDate)
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<DashboardReportResponse | null>(null)

  const formatVnd = (value: number) => `${Math.round(value || 0).toLocaleString('vi-VN')} ₫`

  const fetchReport = useCallback(
    async (params?: ReportQueryParams) => {
      setLoading(true)
      try {
        const res = await getDashboardReport(params ?? { startDate, endDate, category })
        setReport(res.data || null)
      } finally {
        setLoading(false)
      }
    },
    [startDate, endDate, category],
  )

  useEffect(() => {
    fetchReport({ startDate: defaultDates.startDate, endDate: defaultDates.endDate, category: 'all' })
  }, [defaultDates, fetchReport])

  const stats = [
    {
      title: 'Doanh thu',
      value: formatVnd(report?.kpis.revenue || 0),
      change: {
        value: `${(report?.kpis.revenueGrowth || 0) >= 0 ? '+' : ''}${report?.kpis.revenueGrowth || 0}% so với kỳ trước`,
        isPositive: (report?.kpis.revenueGrowth || 0) >= 0,
      },
      icon: DollarSign,
    },
    {
      title: 'Người dùng hoạt động',
      value: report?.kpis.activeUsers || 0,
      change: {
        value: `${(report?.kpis.activeUsersGrowth || 0) >= 0 ? '+' : ''}${report?.kpis.activeUsersGrowth || 0}% so với kỳ trước`,
        isPositive: (report?.kpis.activeUsersGrowth || 0) >= 0,
      },
      icon: Users,
    },
    {
      title: 'Bài học hoàn thành',
      value: report?.kpis.completedLessons || 0,
      change: { value: 'Theo bộ lọc hiện tại', isPositive: true },
      icon: BookOpen,
    },
    {
      title: 'Tổng giờ học',
      value: `${report?.kpis.studyHours || 0}h`,
      change: { value: 'Theo bộ lọc hiện tại', isPositive: true },
      icon: Video,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo và phân tích"
        subtitle="Báo cáo kinh doanh và hiệu suất học tập theo thời gian thực."
        primaryAction={{
          label: 'Làm mới',
          icon: loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />,
          onClick: () => fetchReport(),
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc báo cáo</CardTitle>
          <CardDescription>Chọn phạm vi thời gian và danh mục cần xem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input type="date" className="pl-8" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input type="date" className="pl-8" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select value={category} onValueChange={(v: CategoryFilter) => setCategory(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="grammar">Grammar</SelectItem>
                  <SelectItem value="vocabulary">Vocabulary</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="ipa">IPA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-3">
              <Button className="w-full" disabled={loading} onClick={() => fetchReport({ startDate, endDate, category })}>
                {loading ? 'Đang tải...' : 'Áp dụng'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  setStartDate(defaultDates.startDate)
                  setEndDate(defaultDates.endDate)
                  setCategory('all')
                  fetchReport({ startDate: defaultDates.startDate, endDate: defaultDates.endDate, category: 'all' })
                }}
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatsGrid stats={stats} columns={4} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bài học nổi bật</CardTitle>
            <CardDescription>Theo lượt học và tỷ lệ hoàn thành</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bài học</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Lượt học</TableHead>
                  <TableHead>Hoàn thành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report?.topLessons || []).map((item) => (
                  <TableRow key={`${item.category}-${item.lessonId}`}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.attempts.toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <span className="text-gray-900 font-medium mr-2">{item.completionRate}%</span>
                      <ProgressBar value={item.completionRate} />
                    </TableCell>
                  </TableRow>
                ))}
                {!report?.topLessons?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      Chưa có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo cổng thanh toán</CardTitle>
            <CardDescription>So sánh doanh thu và tỉ trọng từng provider</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Người mua</TableHead>
                  <TableHead>Doanh thu</TableHead>
                  <TableHead>Tỉ trọng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report?.revenueByProvider || []).map((item) => (
                  <TableRow key={item.provider}>
                    <TableCell className="font-medium">{item.provider.toUpperCase()}</TableCell>
                    <TableCell>{item.users.toLocaleString('vi-VN')}</TableCell>
                    <TableCell>{formatVnd(item.revenue)}</TableCell>
                    <TableCell>
                      <span className="text-gray-900 font-medium mr-2">{item.share}%</span>
                      <ProgressBar value={item.share} />
                    </TableCell>
                  </TableRow>
                ))}
                {!report?.revenueByProvider?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      Chưa có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo kỹ năng</CardTitle>
          <CardDescription>Tổng hợp lượt học, hoàn thành, điểm trung bình và giờ học</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kỹ năng</TableHead>
                <TableHead>Lượt học</TableHead>
                <TableHead>Hoàn thành</TableHead>
                <TableHead>Điểm TB</TableHead>
                <TableHead>Giờ học</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(report?.categoryStats || []).map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell>{item.attempts.toLocaleString('vi-VN')}</TableCell>
                  <TableCell>{item.completionRate}%</TableCell>
                  <TableCell>{item.avgProgress}/100</TableCell>
                  <TableCell>{item.studyHours.toLocaleString('vi-VN')}h</TableCell>
                </TableRow>
              ))}
              {!report?.categoryStats?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Chưa có dữ liệu
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center h-2 w-24 bg-gray-100 rounded-full overflow-hidden align-middle">
      <span className="h-2 bg-black rounded-full" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </span>
  )
}
