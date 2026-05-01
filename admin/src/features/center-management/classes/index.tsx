'use client'

import React, { useState } from 'react'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { MOCK_CENTER_CLASSES } from '../mockData'
import { ICenterClass } from '../types'
import {
  Users,
  BookOpen,
  GraduationCap,
  Plus,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  UserPlus,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function ClassesMain() {
  const [filter, setFilter] = useState<'all' | 'kids' | 'teenager' | 'adult'>('all')
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState<ICenterClass | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'students' | 'documents'>('list')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const stats = [
    { title: 'Tổng số lớp', value: String(MOCK_CENTER_CLASSES.length), icon: GraduationCap, color: 'from-blue-500 to-indigo-600', },
    { title: 'Đang giảng dạy', value: '2', icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
    { title: 'Tổng học viên', value: '28', icon: Users, color: 'from-orange-500 to-red-600' },
    { title: 'Tài liệu lưu trữ', value: '45', icon: BookOpen, color: 'from-purple-500 to-pink-600' },
  ]

  const filteredClasses = MOCK_CENTER_CLASSES.filter(c => {
    const matchesFilter = filter === 'all' || c.category === filter
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const categoryLabels = {
    kids: { label: 'Kids Academy', color: 'bg-amber-100 text-amber-700' },
    teenager: { label: 'IELTS Fighter', color: 'bg-blue-100 text-blue-700' },
    adult: { label: 'Professional', color: 'bg-red-100 text-red-700' },
  }

  const handleClassDetail = (c: ICenterClass, mode: 'students' | 'documents') => {
    setSelectedClass(c)
    setViewMode(mode)
  }

  const handleBack = () => {
    setSelectedClass(null)
    setViewMode('list')
  }

  if (viewMode === 'students' && selectedClass) {
    return (
      <AdminPageShell>
        <AdminPageHeader
          title={`Học viên: ${selectedClass.name}`}
          subtitle={`Quản lý danh sách học viên trực tiếp của lớp ${selectedClass.name}`}
          icon={Users}
          tone="indigo"
          actions={
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="rounded-2xl">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl">
                <UserPlus className="w-4 h-4 mr-2" /> Thêm học viên
              </Button>
            </div>
          }
        />

        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500">Tên học viên</th>
                <th className="px-6 py-4 font-bold text-gray-500">Email / Số điện thoại</th>
                <th className="px-6 py-4 font-bold text-gray-500">Ngày nhập học</th>
                <th className="px-6 py-4 font-bold text-gray-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {selectedClass.students.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-600">{s.email}</div>
                    <div className="text-gray-400 text-xs">{s.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{s.joinDate}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" className="rounded-full text-red-500 hover:bg-red-50">
                      <Plus className="w-4 h-4 rotate-45" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPageShell>
    )
  }

  if (viewMode === 'documents' && selectedClass) {
    return (
      <AdminPageShell>
        <AdminPageHeader
          title={`Tài liệu: ${selectedClass.name}`}
          subtitle={`Quản lý kho tài liệu nội bộ dành riêng cho lớp ${selectedClass.name}`}
          icon={FileText}
          tone="emerald"
          actions={
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="rounded-2xl">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-2xl">
                <Plus className="w-4 h-4 mr-2" /> Thêm tài liệu
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedClass.documents.map(d => (
            <div key={d.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-gray-900">{d.title}</h4>
                <p className="text-xs text-gray-400 uppercase font-bold">{d.type} • {d.size}</p>
                <p className="text-xs text-gray-500">Cập nhật: {d.uploadedAt}</p>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          ))}
        </div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Quản lý Lớp học"
        subtitle="Quản lý danh sách lớp học, học viên và tài liệu nội bộ của trung tâm ActiveLearning."
        icon={GraduationCap}
        tone="indigo"
        actions={
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Tạo lớp học mới
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-8 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black text-gray-900">Tạo lớp học mới</DialogTitle>
                <DialogDescription>Nhập các thông tin cơ bản để khởi tạo lớp học tại trung tâm.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Tên lớp học</Label>
                  <Input placeholder="Ví dụ: IELTS Fighter 05" className="rounded-xl border-gray-100" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Danh mục</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl border-gray-100">
                        <SelectValue placeholder="Chọn nhóm" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="kids">Kids Academy</SelectItem>
                        <SelectItem value="teenager">IELTS Fighter</SelectItem>
                        <SelectItem value="adult">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Trình độ</Label>
                    <Input placeholder="Ví dụ: Pre-IELTS" className="rounded-xl border-gray-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Giảng viên phụ trách</Label>
                  <Input placeholder="Nhập tên giáo viên" className="rounded-xl border-gray-100" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-gray-700">Lịch học</Label>
                  <Input placeholder="Ví dụ: Thứ 2, 4, 6 (18:00 - 20:00)" className="rounded-xl border-gray-100" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8" onClick={() => setIsAddModalOpen(false)}>Lưu lớp học</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-8">
        <StatsGrid stats={stats} columns={4} />

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="bg-gray-100 p-1 rounded-2xl">
                <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Tất cả</TabsTrigger>
                <TabsTrigger value="kids" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Kids</TabsTrigger>
                <TabsTrigger value="teenager" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Teenager</TabsTrigger>
                <TabsTrigger value="adult" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Adult</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm tên lớp, giáo viên..."
                  className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="rounded-2xl border-gray-100">
                <Filter className="w-4 h-4 mr-2" />
                Bộ lọc
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((c) => (
              <div key={c.id} className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2">
                      <DropdownMenuItem className="rounded-xl" onClick={() => handleClassDetail(c, 'students')}>Quản lý học viên</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl" onClick={() => handleClassDetail(c, 'documents')}>Quản lý tài liệu</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl">Chỉnh sửa lớp</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl text-red-600">Xóa lớp học</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4" onClick={() => handleClassDetail(c, 'students')}>
                  <Badge className={`${categoryLabels[c.category].color} border-none font-bold px-3 py-1 rounded-full`}>
                    {categoryLabels[c.category].label}
                  </Badge>

                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">{c.name}</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">GV: {c.teacherName}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Khai giảng
                      </p>
                      <p className="text-sm font-bold text-gray-700">{c.startDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Lịch học
                      </p>
                      <p className="text-sm font-bold text-gray-700 truncate">{c.schedule}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); handleClassDetail(c, 'students'); }}>
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        {c.students.length} HS
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600" onClick={(e) => { e.stopPropagation(); handleClassDetail(c, 'documents'); }}>
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        {c.documents.length} TL
                      </div>
                    </div>
                    <Badge variant="outline" className="border-gray-100 text-[10px] font-bold text-gray-400">
                      {c.status === 'ongoing' ? 'Đang dạy' : 'Đang tuyển'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
