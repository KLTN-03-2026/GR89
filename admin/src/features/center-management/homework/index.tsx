'use client'

import React, { useState } from 'react'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { MOCK_HOMEWORK_SUBMISSIONS } from '../mockData'
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Search,
  MoreVertical,
  User,
  GraduationCap,
  FileCheck,
  MessageSquare,
  Send
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

export default function HomeworkMain() {
  const [search, setSearch] = useState('')

  const filteredSubmissions = MOCK_HOMEWORK_SUBMISSIONS.filter(s =>
    s.studentName.toLowerCase().includes(search.toLowerCase()) ||
    s.className.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminPageShell>
      {/* <AdminPageHeader
        title="Chấm bài tập"
        subtitle="Quản lý và chấm điểm các bài tập về nhà được nộp qua Google Drive từ học viên."
      /> */}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Tìm tên học viên, lớp học..."
              className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="rounded-xl px-4 py-2 border-gray-100 text-gray-500 font-bold">
              Đợi chấm: {MOCK_HOMEWORK_SUBMISSIONS.filter(s => s.status === 'pending').length}
            </Badge>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => (
            <div key={sub.id} className="group bg-white rounded-3xl border border-gray-100 p-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-gray-900 text-lg">{sub.studentName}</h3>
                      <Badge className={sub.status === 'corrected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                        {sub.status === 'corrected' ? 'Đã sửa bài' : 'Chờ sửa'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        {sub.className}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {sub.submittedAt}
                      </span>
                    </div>
                    <p className="text-indigo-600 font-bold mt-2 flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      {sub.title}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between gap-4">
                  <div className="flex gap-2">
                    <a
                      href={sub.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mở Google Drive
                    </a>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl p-2">
                        <DropdownMenuItem className="rounded-xl">Xem lịch sử nộp</DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl text-red-600">Hủy bài nộp</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {sub.status === 'corrected' ? (
                    <div className="flex items-center gap-3">
                      <Button variant="outline" className="rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50">
                        Cập nhật bài giải mới
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100">
                        <Send className="w-4 h-4 mr-2" />
                        Gửi bài giải
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminPageShell>
  )
}
