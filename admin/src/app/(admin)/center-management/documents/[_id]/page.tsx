'use client'

import React, { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { FileText, ArrowLeft, Clock, User, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOCK_GLOBAL_DOCUMENTS } from '@/features/center-management/mockData'

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const docId = params?._id as string

  const document = useMemo(() => {
    return MOCK_GLOBAL_DOCUMENTS.find(d => d.id === docId)
  }, [docId])

  if (!document) {
    return (
      <AdminPageShell>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">Không tìm thấy tài liệu</h2>
          <Button onClick={() => router.back()} variant="link" className="mt-4 text-indigo-600">Quay lại</Button>
        </div>
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={document.name}
        subtitle="Chi tiết tài liệu văn bản"
        icon={FileText}
        tone="indigo"
        actions={
          <Button variant="outline" onClick={() => router.back()} className="rounded-2xl border-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 prose prose-indigo max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed">
              {/* Giả lập hiển thị HTML content */}
              <div dangerouslySetInnerHTML={{ __html: document.content }} />
              
              {/* Dummy content for preview if content is short */}
              {document.content.length < 100 && (
                <div className="mt-8 space-y-6">
                  <p>Đây là nội dung chi tiết của tài liệu văn bản. Admin có thể soạn thảo nội dung này bằng trình soạn thảo Rich Text (WYSIWYG) để tạo ra các bài giảng, hướng dẫn sinh động với hình ảnh, bảng biểu và định dạng văn bản đa dạng.</p>
                  <h3>1. Giới thiệu chung</h3>
                  <p>Tài liệu này cung cấp cái nhìn tổng quan về chủ đề được đề cập, giúp học viên nắm bắt các kiến thức trọng tâm một cách hệ thống.</p>
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                    <h4 className="text-indigo-900 mt-0">Lưu ý quan trọng</h4>
                    <p className="text-indigo-700 mb-0 font-medium">Học viên cần đọc kỹ phần này trước khi bắt đầu thực hành các bài tập liên quan.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs border-b border-gray-50 pb-4">Thông tin tài liệu</h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Người soạn</p>
                  <p className="text-sm font-bold text-gray-900">{document.owner}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ngày tạo</p>
                  <p className="text-sm font-bold text-gray-900">12/04/2024</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cập nhật cuối</p>
                  <p className="text-sm font-bold text-gray-900">{document.updatedAt}</p>
                </div>
              </div>
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-12 font-bold shadow-lg shadow-indigo-100">
              Chỉnh sửa nội dung
            </Button>
          </div>
        </div>
      </div>
    </AdminPageShell>
  )
}
