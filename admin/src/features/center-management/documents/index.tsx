'use client'

import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { AdminPageHeader } from '@/components/common/shared/AdminPageHeader'
import { MOCK_GLOBAL_DOCUMENTS } from '../mockData'
import {
  FileText,
  Plus,
  LayoutGrid,
  List,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DocumentCard } from './components/DocumentGrid/DocumentCard'
import { useRouter } from 'next/navigation'
import { SheetAddDocument } from './components/dialogs/SheetAddDocument'
import { DataTable } from '@/components/common/shared/DataTable'
import { columnsDocument } from './components/DocumentTable'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { IGlobalDocument } from '../types'

export default function DocumentsMain() {
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const router = useRouter()

  const filteredDocs = MOCK_GLOBAL_DOCUMENTS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleRefresh = () => {
    console.log('Refresh document list')
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Kho Tài liệu"
        subtitle="Quản lý và lưu trữ hệ thống tài liệu, giáo trình của trung tâm."
        icon={FileText}
        actions={
          <Button
            className="bg-zinc-900 hover:bg-zinc-800 shadow-xl shadow-zinc-200 rounded-2xl h-11 px-6 font-bold transition-all active:scale-95"
            onClick={() => setIsAddSheetOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Tải lên tài liệu mới
          </Button>
        }
      />

      <SheetAddDocument
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        callback={handleRefresh}
      />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm tài liệu..."
              className="pl-10 rounded-2xl border-zinc-100 bg-white focus:ring-2 focus:ring-zinc-900/10 transition-all font-medium h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-zinc-100/80 p-1.5 rounded-2xl gap-1.5 border border-zinc-200/50">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              className={`rounded-xl px-5 h-9 font-bold transition-all ${viewMode === 'grid'
                ? 'bg-white text-zinc-900 shadow-sm hover:bg-white'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Lưới
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className={`rounded-xl px-5 h-9 font-bold transition-all ${viewMode === 'list'
                ? 'bg-white text-zinc-900 shadow-sm hover:bg-white'
                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" /> Danh sách
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={(id) => console.log('Delete', id)}
                onView={(id) => router.push(`/center-management/documents/${id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-[2rem] border-zinc-100 shadow-xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <DataTable
                columns={columnsDocument(handleRefresh) as ColumnDef<{ _id: string }, IGlobalDocument>[]}
                data={filteredDocs.map(doc => ({ ...doc, _id: doc.id }))}
                columnNameSearch="Tên tài liệu"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AdminPageShell>
  )
}
