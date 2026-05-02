'use client'

import React from 'react'
import { User, Clock } from 'lucide-react'
import { IGlobalDocument } from '../../../type'

interface CardInfoProps {
  document: IGlobalDocument
  formattedDate: string
  onClickTitle: () => void
}

export function CardInfo({
  document,
  formattedDate,
  onClickTitle
}: CardInfoProps) {
  return (
    <div className="space-y-4">
      <h3
        className="font-black text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer text-lg leading-tight break-words"
        onClick={onClickTitle}
      >
        {document.name}
      </h3>

      <div className="flex justify-between items-center gap-3 pt-2 border-t border-gray-50">
        <div className="flex items-center gap-1 text-[11px] font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-500 transition-colors min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-400 group-hover:bg-blue-100 transition-colors flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <span className="truncate break-all">
            {typeof document.owner === 'object' ? document.owner?.fullName : 'N/A'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-100 transition-colors">
            <Clock className="w-4 h-4" />
          </div>
          {formattedDate}
        </div>
      </div>
    </div>
  )
}
