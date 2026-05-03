'use client'

import React, { useRef, useState } from 'react'
import { Search, Filter, LayoutGrid, List, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassCard } from './ClassCard'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { GraduationCap, UserCheck, Users, BookOpen } from 'lucide-react'
import { DataTable } from '@/components/common'
import { columnsClasses } from '../ClassesTable/ClassesColumn'
import { ColumnDef } from '@tanstack/react-table'

import { ICenterClass } from '../../../type'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface ClassesContentProps {
  initialData: ICenterClass[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onOpenAddModal?: () => void
}

export default function ClassesContent({ initialData, pagination,onOpenAddModal }: ClassesContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const filter = (() => {
    const raw = searchParams.get('category')
    if (raw === 'kids' || raw === 'teenager' || raw === 'adult') return raw
    return 'all'
  })()
  const currentSearch = searchParams.get('search') || ''

  const updateUrlParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(next).forEach(([key, value]) => {
      if (value == null || value === '') params.delete(key)
      else params.set(key, value)
    })
    if (!params.get('page')) params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const stats = [
    { title: 'Tổng số lớp', value: String(pagination.total), icon: GraduationCap, color: 'from-blue-500 to-indigo-600', },
    { title: 'Đang mở', value: String(initialData.filter(c => c.status === 'opening').length), icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
    { title: 'Tổng học viên', value: String(initialData.reduce((acc, curr) => acc + (curr.students?.length || 0), 0)), icon: Users, color: 'from-orange-500 to-red-600' },
    { title: 'Tài liệu lớp', value: String(initialData.reduce((acc, curr) => acc + (curr.documents?.length || 0), 0)), icon: BookOpen, color: 'from-purple-500 to-pink-600' },
  ]

  return (
    <div className="space-y-8 relative">
      <StatsGrid stats={stats} columns={4} />

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs 
            value={filter} 
            className="w-full md:w-auto" 
            onValueChange={(v) => {
              updateUrlParams({ category: v === 'all' ? null : v, page: '1' })
            }}
          >
            <TabsList className="bg-gray-100 p-1 rounded-2xl">
              <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Tất cả</TabsTrigger>
              <TabsTrigger value="kids" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Kids</TabsTrigger>
              <TabsTrigger value="teenager" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Teenager</TabsTrigger>
              <TabsTrigger value="adult" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">Adult</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm tên lớp, giáo viên..."
                className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                defaultValue={currentSearch}
                ref={searchInputRef}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  const nextValue = (e.currentTarget.value || '').trim()
                  updateUrlParams({ search: nextValue || null, page: '1' })
                }}
              />
            </div>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <Button
                size="sm"
                className={`rounded-xl px-3 h-8 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className={`rounded-xl px-3 h-8 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-gray-100"
              onClick={() => {
                const nextValue = (searchInputRef.current?.value || '').trim()
                updateUrlParams({ search: nextValue || null, page: '1' })
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Tìm
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {initialData.map((c) => (
              <ClassCard key={c._id} classData={c} />
            ))}
            {initialData.length === 0 && (
              <div className="col-span-full py-24 text-center space-y-6 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <GraduationCap className="w-10 h-10 text-gray-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">Chưa có lớp học nào</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">Hệ thống hiện tại chưa có lớp học nào. Hãy bắt đầu bằng cách tạo lớp học đầu tiên.</p>
                </div>
                {onOpenAddModal && (
                  <Button 
                    onClick={onOpenAddModal}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-2xl px-10 h-14 font-bold shadow-lg shadow-indigo-100"
                  >
                    <Plus className="w-5 h-5 mr-2" /> Tạo lớp học ngay
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <DataTable
              columns={columnsClasses() as ColumnDef<ICenterClass, unknown>[]}
              data={initialData}
              isLoading={false}
              columnNameSearch="name"
              pagination={pagination}
              onPageChange={(page) => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('page', String(page))
                router.push(`${pathname}?${params.toString()}`)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
