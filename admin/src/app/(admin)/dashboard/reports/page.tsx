import React from 'react'

import { PageHeader } from '@/components/common/shared/PageHeader'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Calendar, Users, BookOpen, Video, DollarSign } from 'lucide-react'

export default function page() {
  const stats = [
    {
      title: 'Doanh thu (tháng)',
      value: '₫128,450,000',
      change: { value: '+8.2% so với tháng trước', isPositive: true },
      icon: DollarSign,
    },
    {
      title: 'Người dùng hoạt động',
      value: '3,284',
      change: { value: '+3.1% tháng này', isPositive: true },
      icon: Users,
    },
    {
      title: 'Bài học đã hoàn thành',
      value: '2,146',
      change: { value: '+1.4% tuần này', isPositive: true },
      icon: BookOpen,
    },
    {
      title: 'Giờ học qua video',
      value: '4,912h',
      change: { value: '-0.6% tuần này', isPositive: false },
      icon: Video,
    },
  ]

  const topLessons = [
    { title: 'Ngữ pháp: Thì hiện tại hoàn thành', category: 'Grammar', views: 12450, completion: '78%' },
    { title: 'Từ vựng: Travel', category: 'Vocabulary', views: 9320, completion: '64%' },
    { title: 'Listening: Daily Conversation 03', category: 'Listening', views: 8760, completion: '72%' },
    { title: 'IPA: Vowel Sounds', category: 'IPA', views: 6540, completion: '69%' },
  ]

  const acquisition = [
    { source: 'Organic Search', users: 2140, conv: '5.2%' },
    { source: 'Social (Facebook)', users: 1680, conv: '3.1%' },
    { source: 'Referral', users: 940, conv: '6.8%' },
    { source: 'Ads', users: 720, conv: '2.4%' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo và phân tích"
        subtitle="Phân tích số liệu kinh doanh và hiệu suất học tập theo khoảng thời gian."
        primaryAction={{ label: 'Xuất báo cáo', icon: <Download className="w-4 h-4" /> }}
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
                <Input type="date" className="pl-8" defaultValue={new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input type="date" className="pl-8" defaultValue={new Date().toISOString().slice(0, 10)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Danh mục</Label>
              <Select defaultValue="all">
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
              <Button className="w-full">Áp dụng</Button>
              <Button variant="outline" className="w-full">Đặt lại</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <StatsGrid stats={stats} columns={4} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bài học nổi bật</CardTitle>
              <CardDescription>Hiệu suất theo lượt xem và hoàn thành</CardDescription>
            </div>
            <Button variant="outline" size="sm">Tải CSV</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bài học</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Lượt xem</TableHead>
                  <TableHead>Hoàn thành</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLessons.map((l, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{l.title}</TableCell>
                    <TableCell>{l.category}</TableCell>
                    <TableCell>{l.views.toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <span className="text-gray-900 font-medium mr-2">{l.completion}</span>
                      <ProgressBar value={parseInt(l.completion)} />
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
              <CardTitle>Kênh thu hút người dùng</CardTitle>
              <CardDescription>So sánh số người dùng và tỉ lệ chuyển đổi</CardDescription>
            </div>
            <Button variant="outline" size="sm">Tải CSV</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nguồn</TableHead>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Chuyển đổi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acquisition.map((a, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{a.source}</TableCell>
                    <TableCell>{a.users.toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <span className="text-gray-900 font-medium mr-2">{a.conv}</span>
                      <ProgressBar value={parseFloat(a.conv)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
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
