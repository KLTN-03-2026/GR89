import React from 'react'

import { PageHeader } from '@/components/common/shared/PageHeader'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Users,
  BookOpen,
  Video,
  Image as ImageIcon,
  TrendingUp,
  ArrowRight,
  PlayCircle,
  FileText,
} from 'lucide-react'

export default function page() {
  const stats = [
    {
      title: 'Tổng người dùng',
      value: '12,450',
      change: { value: '+4.6% so với tháng trước', isPositive: true },
      icon: Users,
    },
    {
      title: 'Bài học đã xuất bản',
      value: '368',
      change: { value: '+2.1% tháng này', isPositive: true },
      icon: BookOpen,
    },
    {
      title: 'Video tải lên',
      value: '1,124',
      change: { value: '-0.8% tuần này', isPositive: false },
      icon: Video,
    },
    {
      title: 'Hình ảnh mới',
      value: '2,731',
      change: { value: '+6.3% tuần này', isPositive: true },
      icon: ImageIcon,
    },
  ]

  const recentUsers = [
    { name: 'Nguyễn Văn A', email: 'nva@example.com', joined: '2 ngày trước', plan: 'Free' },
    { name: 'Trần Thị B', email: 'ttb@example.com', joined: '4 ngày trước', plan: 'Pro' },
    { name: 'Lê C', email: 'lec@example.com', joined: '1 tuần trước', plan: 'Pro' },
    { name: 'Phạm D', email: 'phamd@example.com', joined: '2 tuần trước', plan: 'Free' },
  ]

  const recentMedia = [
    { title: 'Daily Conversation 01', type: 'Video', size: '120 MB', time: '1 giờ trước' },
    { title: 'Basic IPA Chart', type: 'Hình ảnh', size: '2.3 MB', time: '5 giờ trước' },
    { title: 'Listening Practice Set', type: 'Audio', size: '35 MB', time: 'Hôm qua' },
    { title: 'Speaking Tips PDF', type: 'Tài liệu', size: '1.2 MB', time: '2 ngày trước' },
  ]

  const activities = [
    { icon: PlayCircle, title: 'Video mới', desc: 'Daily Conversation 01 đã được xuất bản', time: '30 phút trước' },
    { icon: FileText, title: 'Bài học mới', desc: 'Ngữ pháp: Mệnh đề quan hệ', time: '3 giờ trước' },
    { icon: Users, title: 'Người dùng mới', desc: '34 người dùng mới đăng ký', time: 'Hôm qua' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tổng quan hệ thống"
        subtitle="Theo dõi số liệu quan trọng và hoạt động gần đây của nền tảng."
        primaryAction={{ label: 'Báo cáo nhanh', icon: <TrendingUp className="w-4 h-4" /> }}
      />

      <StatsGrid stats={stats} columns={4} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Người dùng mới</CardTitle>
                <CardDescription>Những tài khoản đăng ký gần đây</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((u, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${u.plan === 'Pro'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                          }`}>
                          {u.plan}
                        </span>
                      </TableCell>
                      <TableCell>{u.joined}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Nội dung đa phương tiện gần đây</CardTitle>
                <CardDescription>Những mục mới được tải lên</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                Quản lý media
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Kích thước</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMedia.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{m.title}</TableCell>
                      <TableCell>{m.type}</TableCell>
                      <TableCell>{m.size}</TableCell>
                      <TableCell>{m.time}</TableCell>
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
                <CardTitle>Hoạt động gần đây</CardTitle>
                <CardDescription>Cập nhật theo thời gian</CardDescription>
              </div>
              <Button variant="outline" size="sm">Làm mới</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {activities.map((a, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="text-gray-500">
                      <a.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      <p className="text-sm text-gray-600">{a.desc}</p>
                      <p className="text-xs text-gray-500 mt-1">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mục tiêu tuần này</CardTitle>
              <CardDescription>Theo dõi tiến độ các chỉ tiêu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressItem label="Xuất bản 8 bài học" value={62} />
                <ProgressItem label="Tăng 5% người dùng hoạt động" value={48} />
                <ProgressItem label="Tải lên 20 media mới" value={75} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ProgressItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-2 bg-black rounded-full" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
