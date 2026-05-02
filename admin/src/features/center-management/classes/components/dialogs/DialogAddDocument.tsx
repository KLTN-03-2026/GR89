'use client'

import React, { useState } from 'react'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Check } from 'lucide-react'
import { DocumentCard } from '@/features/center-management/documents/components/DocumentGrid/DocumentCard'
import { MOCK_GLOBAL_DOCUMENTS } from '@/features/center-management/mockData'

interface DialogAddDocumentProps {
  onClose: () => void
  callback?: () => void
}

export function DialogAddDocument({ onClose, callback }: DialogAddDocumentProps) {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filteredDocs = MOCK_GLOBAL_DOCUMENTS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!selectedId) return
    console.log('Adding document to class:', selectedId)
    if (callback) callback()
    onClose()
  }

  return (
    <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                selectable
                isSelected={selectedId === doc.id}
                onSelect={() => setSelectedId(doc.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="p-8 pt-4 bg-gray-50/50 border-t border-gray-100 gap-2 sm:gap-0">
        <div className="flex-1 text-sm text-gray-500 font-medium flex items-center">
          {selectedId ? (
            <span className="text-indigo-600 font-bold flex items-center">
              <Check className="w-4 h-4 mr-1.5" /> Đã chọn 1 tài liệu
            </span>
          ) : 'Chưa chọn tài liệu nào'}
        </div>
        <Button variant="outline" className="rounded-xl px-6" onClick={onClose}>Hủy</Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8"
          onClick={handleSave}
          disabled={!selectedId}
        >
          Thêm vào lớp
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
