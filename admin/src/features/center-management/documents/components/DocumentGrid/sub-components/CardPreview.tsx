'use client'

import React from 'react'
import { FileText } from 'lucide-react'

export function CardPreview() {
  return (
    <div className="aspect-[5/3] rounded-[1.5rem] bg-gradient-to-br from-blue-50 to-indigo-50/50 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform duration-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] group-hover:scale-150 transition-transform duration-1000" />
      <div className="relative">
        <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-150 group-hover:bg-blue-400/40 transition-colors" />
        <FileText className="w-20 h-20 text-blue-500 relative z-10 drop-shadow-[0_10px_10px_rgba(59,130,246,0.2)] group-hover:rotate-3 transition-transform duration-500" />
      </div>
    </div>
  )
}
