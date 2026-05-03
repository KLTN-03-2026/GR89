'use client'

import React, { useState } from 'react'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { FileText, ArrowLeft, Clock, User, Calendar, Tag, Pencil, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { IGlobalDocument } from '../../type'
import { SheetUpdateDocument } from '../dialogs/SheetUpdateDocument'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { downloadGlobalDocumentDocx } from '../../services/api'

interface DocumentDetailMainProps {
  document: IGlobalDocument
}

export default function DocumentDetailMain({ document }: DocumentDetailMainProps) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  const createdAt = document.createdAt ? format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'
  const updatedAt = document.updatedAt ? format(new Date(document.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi }) : 'N/A'

  const owner = typeof document.owner === 'object' ? document.owner : null;
  const ownerName = owner?.fullName || 'N/A';
  const ownerAvatar = owner?.avatar || '';

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadGlobalDocumentDocx(document._id, document.name)
      toast.success('Đã tải xuống file .docx')
    } catch (error) {
      toast.error('Lỗi khi xuất file')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title={document.name}
        subtitle="Chi tiết tài liệu văn bản"
        icon={FileText}
        tone="blue"
        actions={
          <div className="flex gap-3">
            <Button asChild variant="outline" className="rounded-2xl border-gray-100 font-bold hover:bg-gray-50 transition-colors">
              <Link href="/center-management/documents">
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Link>
            </Button>

            <Button
              variant="outline"
              className="rounded-2xl border-gray-100 font-bold hover:bg-blue-50 hover:text-blue-600 transition-all"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Tải về .docx
            </Button>

            <Button
              className="rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100 text-white transition-all active:scale-95"
              onClick={() => setIsUpdateOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-2" /> Chỉnh sửa
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-50/50 overflow-hidden min-h-[600px]">
            <div className="p-8 md:p-16 prose prose-blue max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-lg">
              <div dangerouslySetInnerHTML={{ __html: document.content }} />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-50/20 p-8 space-y-8 sticky top-8">
            <h4 className="font-black text-gray-900 uppercase tracking-[0.15em] text-[11px] border-b border-gray-50 pb-5">Siêu dữ liệu</h4>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <Avatar className="w-12 h-12 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <AvatarImage src={ownerAvatar} alt={ownerName} className="object-cover" />
                  <AvatarFallback className="bg-blue-50 text-blue-500 font-black">
                    {ownerName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Người soạn</p>
                  <p className="text-sm font-black text-gray-900 mt-0.5">{ownerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Danh mục</p>
                  <p className="text-sm font-black text-blue-600 mt-0.5">{typeof document.category === 'object' ? document.category?.name : 'None'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ngày tạo</p>
                  <p className="text-sm font-black text-gray-900 mt-0.5">{createdAt}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Cập nhật cuối</p>
                  <p className="text-sm font-black text-gray-900 mt-0.5">{updatedAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SheetUpdateDocument
        open={isUpdateOpen}
        documentId={document._id}
        onOpenChange={setIsUpdateOpen}
        callback={() => router.refresh()}
      />
    </AdminPageShell>
  )
}
