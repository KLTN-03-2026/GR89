'use client'

import React, { useState } from 'react'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { ClassesHeader } from './ClassesMain/ClassesHeader'
import ClassesContent from './ClassesMain/ClassesContent'

import { ICenterClass } from '../../type'

interface ClassesMainProps {
  initialData: ICenterClass[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function ClassesMain({ initialData, pagination }: ClassesMainProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <AdminPageShell>
      <ClassesHeader 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={setIsAddModalOpen} 
      />
      <ClassesContent 
        initialData={initialData}
        pagination={pagination}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />
    </AdminPageShell>
  )
}
