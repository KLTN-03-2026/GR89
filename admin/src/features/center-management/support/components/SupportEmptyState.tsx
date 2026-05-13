'use client'

import React from 'react'
import { MessagesSquare } from 'lucide-react'

export function SupportEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-[calc(100vh-320px)] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <MessagesSquare className="h-7 w-7" />
        </div>
        <h3 className="text-base font-black text-gray-900">{title}</h3>
        <p className="mt-2 text-sm font-medium text-gray-500">{description}</p>
      </div>
    </div>
  )
}

