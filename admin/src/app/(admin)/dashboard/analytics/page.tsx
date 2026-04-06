import React from 'react'

import { PageHeader } from '@/components/common/shared/PageHeader'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { TrendingUp, Users, Activity, Clock, Globe, ArrowRight, Smartphone, Monitor, TabletSmartphone } from 'lucide-react'

export default function page() {
  const stats = [
    {
      title: 'Phiên truy cập',
      value: '58,420',
      change: { value: '+5.4% so với tuần trước', isPositive: true },
      icon: Activity,
    },
    {
      title: 'Người dùng duy nhất',
      value: '34,210',
      change: { value: '+3.2% tuần này', isPositive: true },
      icon: Users,
    },
    {
      title: 'Thời gian phiên (TB)',
      value: '7m 12s',
      change: { value: '+0.9% tuần này', isPositive: true },
      icon: Clock,
    },
    {
      title: 'Tỉ lệ thoát',
      value: '32.4%',
      change: { value: '-1.2% tuần này', isPositive: true },
      icon: TrendingUp,
    },
  ]

  const topCountries = [
    { country: 'Việt Nam', users: 18240, percent: 48 },
    { country: 'Hoa Kỳ', users: 6240, percent: 16 },
    { country: 'Nhật Bản', users: 5460, percent: 14 },
    { country: 'Hàn Quốc', users: 3640, percent: 10 },
    { country: 'Khác', users: 2920, percent: 12 },
  ]

  const trafficSources = [
    { source: 'Organic Search', sessions: 21420, percent: 44 },
    { source: 'Direct', sessions: 14210, percent: 29 },
    { source: 'Social', sessions: 6240, percent: 13 },
    { source: 'Referral', sessions: 4540, percent: 9 },
    { source: 'Email', sessions: 2010, percent: 5 },
  ]

  const deviceBreakdown = [
    { device: 'Mobile', icon: Smartphone, percent: 62 },
    { device: 'Desktop', icon: Monitor, percent: 28 },
    { device: 'Tablet', icon: TabletSmartphone, percent: 10 },
  ]

  const trends = [
    { title: 'Tỉ lệ hoàn thành bài học', value: '72%', change: '+4.1%', positive: true },
    { title: 'Điểm trung bình bài kiểm tra', value: '8.2/10', change: '+0.3', positive: true },
    { title: 'Tỉ lệ quay lại ngày tiếp theo', value: '37%', change: '-1.2%', positive: false },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phân tích hành vi người dùng"
        subtitle="Theo dõi tăng trưởng phiên truy cập, nguồn lưu lượng và thiết bị."
        primaryAction={{ label: 'Báo cáo nhanh', icon: <TrendingUp className="w-4 h-4" /> }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc phân tích</CardTitle>
          <CardDescription>Tinh chỉnh phạm vi thời gian và phân khúc</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>Khoảng thời gian</Label>
              <Select defaultValue="7d">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoảng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 ngày qua</SelectItem>
                  <SelectItem value="30d">30 ngày qua</SelectItem>
                  <SelectItem value="90d">90 ngày qua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phân khúc</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phân khúc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="new">Người dùng mới</SelectItem>
                  <SelectItem value="returning">Người dùng quay lại</SelectItem>
                  <SelectItem value="pro">Người dùng Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Từ khóa</Label>
              <Input placeholder="Tìm theo bài học, nguồn..." />
            </div>
            <div className="flex items-end gap-3">
              <Button className="w-full">Áp dụng</Button>
              <Button variant="outline" className="w-full">Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatsGrid stats={stats} columns={4} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Nguồn lưu lượng</CardTitle>
                <CardDescription>Tỉ trọng các nguồn mang lại phiên truy cập</CardDescription>
              </div>
              <Button variant="outline" size="sm">Xem chi tiết</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Phiên</TableHead>
                    <TableHead>Tỉ trọng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trafficSources.map((s, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{s.source}</TableCell>
                      <TableCell>{s.sessions.toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <PercentBar value={s.percent} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quốc gia hàng đầu</CardTitle>
                <CardDescription>Người dùng theo quốc gia</CardDescription>
              </div>
              <Button variant="outline" size="sm"><Globe className="w-4 h-4" />
                Bản đồ
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quốc gia</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Tỉ trọng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCountries.map((c, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{c.country}</TableCell>
                      <TableCell>{c.users.toLocaleString('vi-VN')}</TableCell>
                      <TableCell>
                        <PercentBar value={c.percent} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Thiết bị truy cập</CardTitle>
                <CardDescription>Tỉ lệ người dùng theo thiết bị</CardDescription>
              </div>
              <Button variant="outline" size="sm">Báo cáo</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceBreakdown.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <d.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-800">{d.device}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900 w-10 text-right">{d.percent}%</span>
                      <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-2 bg-black rounded-full" style={{ width: `${d.percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Xu hướng học tập</CardTitle>
                <CardDescription>Các chỉ số hiệu suất chính</CardDescription>
              </div>
              <Button variant="outline" size="sm">Chi tiết
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {trends.map((t, idx) => (
                  <div key={idx} className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-sm text-gray-600">Giá trị hiện tại</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{t.value}</p>
                      <p className={`text-xs ${t.positive ? 'text-green-600' : 'text-red-600'}`}>{t.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PercentBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-900 w-10 text-right">{clamped}%</span>
      <span className="inline-flex items-center h-2 w-28 bg-gray-100 rounded-full overflow-hidden align-middle">
        <span className="h-2 bg-black rounded-full" style={{ width: `${clamped}%` }} />
      </span>
    </div>
  )
}
