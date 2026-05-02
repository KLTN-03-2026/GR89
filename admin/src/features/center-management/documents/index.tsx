'use client'

import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import {
  FileText,
  Plus,
  LayoutGrid,
  List,
  FolderEdit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DocumentCard } from './components/DocumentGrid/DocumentCard'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { SheetAddDocument } from './components/dialogs/SheetAddDocument'
import { SheetUpdateDocument } from './components/dialogs/SheetUpdateDocument'
import { SheetManageCategories } from './components/dialogs/SheetManageCategories'
import { DocumentFilters } from './components/DocumentFilters'
import { DataTable } from '@/components/common/shared/DataTable'
import { Card, CardContent } from '@/components/ui/card'
import { deleteGlobalDocument } from './services/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { columnsDocument } from './components/DocumentTable/DocumentColumn'
import { IGlobalDocument } from './type'

interface DocumentsMainProps {
  initialData: IGlobalDocument[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DocumentsMain({ initialData, pagination }: DocumentsMainProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false)
  const [updateSheetData, setUpdateSheetData] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const handleRefresh = () => {
    router.refresh()
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDelete = async () => {
    const id = deleteConfirm.id
    if (!id) return

    try {
      await deleteGlobalDocument(id)
      toast.success('Xóa tài liệu thành công')
      handleRefresh()
      setDeleteConfirm({ open: false, id: null })
    } catch (error) {
      toast.error('Lỗi khi xóa tài liệu')
    }
  }

  const handleEdit = (id: string) => {
    setUpdateSheetData({ open: true, id })
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Kho Tài liệu"
        subtitle="Quản lý và lưu trữ hệ thống tài liệu, giáo trình của trung tâm."
        icon={FileText}
        tone="blue"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-2xl h-11 px-6 font-bold border-gray-100 hover:bg-blue-50 hover:text-blue-600 transition-all"
              onClick={() => setIsManageCategoriesOpen(true)}
            >
              <FolderEdit className="w-4 h-4 mr-2" />
              Quản lý danh mục
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 rounded-2xl h-11 px-6 font-bold transition-all active:scale-95 text-white"
              onClick={() => setIsAddSheetOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tải lên tài liệu mới
            </Button>
          </div>
        }
      />

      {/* Dialog xác nhận xóa */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-gray-900">Xác nhận xóa tài liệu?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 font-medium text-base">
              Hành động này không thể hoàn tác. Tài liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl px-8 h-12 font-bold border-gray-100 hover:bg-gray-50 transition-colors">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl px-8 h-12 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-100 transition-all active:scale-95"
            >
              Đồng ý xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SheetAddDocument
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        callback={handleRefresh}
      />

      <SheetUpdateDocument
        open={updateSheetData.open}
        documentId={updateSheetData.id}
        onOpenChange={(open) => setUpdateSheetData(prev => ({ ...prev, open }))}
        callback={handleRefresh}
      />

      <SheetManageCategories
        open={isManageCategoriesOpen}
        onOpenChange={setIsManageCategoriesOpen}
        callback={handleRefresh}
      />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <DocumentFilters />
          <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1.5 border border-gray-200/50 shadow-inner flex-shrink-0">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className={`rounded-xl px-5 h-9 font-bold transition-all ${viewMode === 'grid'
                ? 'bg-white text-blue-600 shadow-md hover:bg-white'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Lưới
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={`rounded-xl px-5 h-9 font-bold transition-all ${viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-md hover:bg-white'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" /> Danh sách
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {initialData.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onDelete={(id) => setDeleteConfirm({ open: true, id })}
                onEdit={handleEdit}
                onView={(id) => router.push(`/center-management/documents/${id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-[2rem] border-zinc-100 shadow-xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <DataTable
                columns={columnsDocument(handleRefresh)}
                data={initialData}
                columnNameSearch=""
                serverSidePagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageShell>
  )
}
