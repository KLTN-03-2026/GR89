'use client'

import React, { useState } from 'react'
import { Search, Filter, LayoutGrid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClassCard } from './ClassCard'
import { StatsGrid } from '@/components/common/shared/StatsGrid'
import { GraduationCap, UserCheck, Users, BookOpen } from 'lucide-react'
import { MOCK_CENTER_CLASSES } from '@/features/center-management/mockData'
import { DataTable } from '@/components/common'
import { columnsClasses } from '../ClassesTable/ClassesColumn'
import { ColumnDef } from '@tanstack/react-table'

interface ClassesContentProps {
  refresh: boolean
  callback: () => void
}

export default function ClassesContent({ refresh, callback }: ClassesContentProps) {
  const [filter, setFilter] = useState<'all' | 'kids' | 'teenager' | 'adult'>('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const stats = [
    { title: 'Tổng số lớp', value: String(MOCK_CENTER_CLASSES.length), icon: GraduationCap, color: 'from-blue-500 to-indigo-600', },
    { title: 'Đang giảng dạy', value: '2', icon: UserCheck, color: 'from-emerald-500 to-teal-600' },
    { title: 'Tổng học viên', value: '28', icon: Users, color: 'from-orange-500 to-red-600' },
    { title: 'Tài liệu lưu trữ', value: '45', icon: BookOpen, color: 'from-purple-500 to-pink-600' },
  ]

  const filteredClasses = MOCK_CENTER_CLASSES.filter(c => {
    const matchesFilter = filter === 'all' || c.category === filter
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} columns={4} />

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={(v) => setFilter(v as any)}>
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              <Button
                variant={viewMode === 'grid' ? 'white' as any : 'ghost'}
                size="sm"
                className={`rounded-xl px-3 h-8 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'white' as any : 'ghost'}
                size="sm"
                className={`rounded-xl px-3 h-8 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" className="rounded-2xl border-gray-100">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map((c) => (
              <ClassCard key={c.id} classData={c} callback={callback} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <DataTable
              columns={columnsClasses(callback) as ColumnDef<{ _id: string }, unknown>[]}
              data={filteredClasses.map(c => ({ _id: c.id, ...c }))}
              isLoading={false}
              columnNameSearch="name"
            />
          </div>
        )}
      </div>
    </div>
  )
}
