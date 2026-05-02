'use client'

import React from 'react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IGlobalDocument } from '../../type'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { toast } from 'react-toastify'
import { downloadGlobalDocumentDocx } from '../../services/api'

// Sub-components
import { CardBadge } from './sub-components/CardBadge'
import { CardActions } from './sub-components/CardActions'
import { CardPreview } from './sub-components/CardPreview'
import { CardInfo } from './sub-components/CardInfo'

interface DocumentCardProps {
  document: IGlobalDocument
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  onSelect?: (document: IGlobalDocument) => void
  selectable?: boolean
  isSelected?: boolean
}

export function DocumentCard({
  document,
  onDelete,
  onEdit,
  onSelect,
  selectable,
  isSelected
}: DocumentCardProps) {
  const router = useRouter()
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportDocx = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExporting(true)
    try {
      await downloadGlobalDocumentDocx(document._id, document.name)
      toast.success('Đã tải xuống file .docx')
    } catch (error) {
      toast.error('Lỗi khi tải xuống file')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClick = () => {
    if (selectable) {
      onSelect?.(document)
    } else {
      router.push(`/center-management/documents/${document._id}`)
    }
  }

  const formattedDate = document.updatedAt
    ? format(new Date(document.updatedAt), 'dd/MM/yyyy', { locale: vi })
    : 'N/A'

  const categoryName = typeof document.category === 'object' ? document.category?.name : undefined

  return (
    <div className={`group relative bg-white rounded-lg border-2 ${isSelected ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-100'} p-4 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover:-translate-y-1 transition-all duration-500 cursor-pointer`}>
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Extension Badge */}
      <CardBadge categoryName={categoryName} />

      {/* Actions */}
      {!selectable && (
        <CardActions
          document={document}
          onEdit={onEdit}
          onDelete={onDelete}
          onExport={handleExportDocx}
          isExporting={isExporting}
        />
      )}

      {/* Visual representation */}
      <CardPreview />

      {/* Info */}
      <CardInfo
        document={document}
        formattedDate={formattedDate}
        onClickTitle={handleClick}
      />

      {/* Selection Overlay */}
      {selectable && isSelected && (
        <div className="absolute inset-0 bg-blue-600/10 pointer-events-none flex items-center justify-center backdrop-blur-[2px] z-20 animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-2xl scale-110 rotate-12 animate-in zoom-in-50 duration-500">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
        </div>
      )}
    </div>
  )
}
