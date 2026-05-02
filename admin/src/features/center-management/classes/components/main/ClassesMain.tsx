'use client'

import React, { useState } from 'react'
import { AdminPageShell } from '@/components/common/shared/AdminPageShell'
import { ClassesHeader } from '../ClassesMain/ClassesHeader'
import ClassesContent from '../ClassesMain/ClassesContent'

export function ClassesMain() {
  const [refresh, setRefresh] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  return (
    <AdminPageShell>
      <ClassesHeader 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={setIsAddModalOpen} 
        callback={() => setRefresh(!refresh)} 
      />
      <ClassesContent 
        refresh={refresh} 
        callback={() => setRefresh(!refresh)} 
      />
    </AdminPageShell>
  )
}
