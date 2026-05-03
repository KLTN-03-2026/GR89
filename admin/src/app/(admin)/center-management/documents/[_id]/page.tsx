import React from 'react'
import { getGlobalDocumentByIdServer } from '@/features/center-management/documents/services/serverApi'
import DocumentDetailMain from '@/features/center-management/documents/components/DocumentDetail/DocumentDetailMain'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ _id: string }>
}

export default async function DocumentDetailPage({ params }: PageProps) {
  const { _id } = await params
  const document = await getGlobalDocumentByIdServer(_id)

  if (!document) {
    return (
      <AdminPageShell>
        <div className="p-20 text-center space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Không tìm thấy tài liệu</h2>
          <p className="text-gray-500 max-w-xs mx-auto">Tài liệu này có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
          <Button asChild variant="outline" className="rounded-2xl mt-4 px-8 border-gray-200 font-bold">
            <Link href="/center-management/documents">Quay lại danh sách</Link>
          </Button>
        </div>
      </AdminPageShell>
    )
  }

  return <DocumentDetailMain document={document} />
}