'use client'

import React, { useEffect, useState } from 'react'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Check, FileText, Loader2 } from 'lucide-react'
import { DocumentCard } from '@/features/center-management/documents/components/DocumentGrid/DocumentCard'
import { IGlobalDocument } from '@/features/center-management/documents/type'
import { getGlobalDocuments } from '@/features/center-management/documents/services/api'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from 'react-toastify'
import { useParams, useRouter } from 'next/navigation'
import { addDocumentToClass } from '../../services/api'

interface DialogAddDocumentProps {
  open: boolean
  onClose: () => void
}

export function DialogAddDocument({ open, onClose }: DialogAddDocumentProps) {
  const params = useParams()
  const classId = params?._id as string
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [documents, setDocuments] = useState<IGlobalDocument[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<IGlobalDocument | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const fetchDocuments = async () => {
      setIsLoadingDocs(true)
      try {
        const response = await getGlobalDocuments({ search: debouncedSearch, limit: 100 })
        if (response.success) {
          setDocuments(response.data || [])
          return
        }
        setDocuments([])
        toast.error(response.message || 'Không thể tải danh sách tài liệu')
      } catch {
        setDocuments([])
        toast.error('Không thể tải danh sách tài liệu')
      } finally {
        setIsLoadingDocs(false)
      }
    }
    fetchDocuments()
  }, [open, debouncedSearch])

  useEffect(() => {
    if (open) return
    setSearch('')
    setSelectedDoc(null)
    setDocuments([])
    setIsLoadingDocs(false)
  }, [open])

  const handleSave = async () => {
    if (!selectedDoc) return
    if (!classId) {
      toast.error('Không xác định được lớp học')
      return
    }

    setIsSaving(true)
    await addDocumentToClass(classId, { documentId: selectedDoc._id })
      .then((res) => {
        if (res.success) {
          toast.success('Đã thêm tài liệu vào lớp thành công')
          onClose()
          router.refresh()
        }
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  return (
    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
      <DialogHeader className="p-8 pb-0">
        <DialogTitle className="text-2xl font-black text-gray-900">Chọn tài liệu từ kho</DialogTitle>
        <DialogDescription>Chọn tài liệu đã có sẵn trong hệ thống để thêm vào lớp học.</DialogDescription>
      </DialogHeader>

      <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm tài liệu..."
            className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isLoadingDocs ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="font-bold text-sm">Đang tải danh sách tài liệu...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  selectable
                  variant='compact'
                  isSelected={selectedDoc?._id === doc._id}
                  onSelect={(document) => setSelectedDoc(document)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400 gap-3">
              <FileText className="w-10 h-10 opacity-20" />
              <p className="font-bold text-sm">Không tìm thấy tài liệu nào</p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 gap-2 sm:gap-0">
        <div className="flex-1 text-sm text-gray-500 font-medium flex items-center">
          {selectedDoc ? (
            <span className="text-indigo-600 font-bold flex items-center">
              <Check className="w-4 h-4 mr-1.5" /> Đã chọn 1 tài liệu
            </span>
          ) : 'Chưa chọn tài liệu nào'}
        </div>
        <Button variant="outline" className="rounded-xl px-6" onClick={onClose}>Hủy</Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8"
          onClick={handleSave}
          disabled={!selectedDoc || isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Thêm vào lớp
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
