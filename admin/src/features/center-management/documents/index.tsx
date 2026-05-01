'use client'

import React, { useState } from 'react'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { MOCK_GLOBAL_DOCUMENTS } from '../mockData'
import {
  FileText,
  MoreVertical,
  Search,
  Plus,
  Clock,
  User,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DocumentsMain() {
  const [search, setSearch] = useState('')

  const filteredDocs = MOCK_GLOBAL_DOCUMENTS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Kho Tài liệu Văn bản"
        subtitle="Lưu trữ và quản lý các bài giảng, tài liệu dưới dạng văn bản (Rich Text)."
        icon={FileText}
        tone="indigo"
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-2xl">
            <Plus className="w-4 h-4 mr-2" />
            Soạn thảo tài liệu mới
          </Button>
        }
      />

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="border border-gray-100 rounded-3xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Tên tài liệu</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Người soạn</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Cập nhật</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-500" />
                      </div>
                      <span className="text-gray-600 font-medium">{doc.owner}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500 font-medium text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {doc.updatedAt}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-full text-blue-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full text-amber-600">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageShell>
  )
}
