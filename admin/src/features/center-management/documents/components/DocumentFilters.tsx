'use client'

import React, { useEffect, useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { getGlobalDocumentCategories } from '../services/api'
import { IDocumentCategory } from '../type'
import { useDebounce } from '@/hooks/useDebounce'

export function DocumentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [categories, setCategories] = useState<IDocumentCategory[]>([])
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchValue, 500)

  const currentCategory = searchParams.get('category') || 'all'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getGlobalDocumentCategories()
        if (response.success && response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh mục:', error)
      }
    }
    fetchCategories()
  }, [])

  // Cập nhật URL khi search thay đổi (đã debounce)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }
    params.set('page', '1')

    // Chỉ push nếu thực sự có thay đổi so với hiện tại
    const currentSearch = searchParams.get('search') || ''
    if (debouncedSearch !== currentSearch) {
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [debouncedSearch, pathname, router, searchParams])

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchValue('')
    const params = new URLSearchParams()
    router.push(pathname)
  }

  const hasFilters = searchValue || currentCategory !== 'all'

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Search Input */}
      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Tìm kiếm theo tên tài liệu..."
          className="pl-10 rounded-2xl border-gray-100 bg-white focus:ring-2 focus:ring-blue-500/10 transition-all font-medium h-11 border-2 focus:border-blue-500/20"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Select */}
      <div className="w-full md:w-64">
        <Select value={currentCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="rounded-2xl h-11 border-2 border-gray-100 bg-white font-bold text-gray-600 focus:ring-blue-500/10 focus:border-blue-500/20 transition-all">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              <SelectValue placeholder="Tất cả danh mục" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl p-1">
            <SelectItem value="all" className="rounded-xl font-bold py-3 cursor-pointer focus:bg-blue-50 focus:text-blue-600">
              Tất cả danh mục
            </SelectItem>
            {categories.map((cat) => (
              <SelectItem
                key={cat._id}
                value={cat._id}
                className="rounded-xl font-bold py-3 cursor-pointer focus:bg-blue-50 focus:text-blue-600"
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Button (Optional) */}
      {hasFilters && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="rounded-2xl h-11 px-4 font-bold text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
        >
          Xóa lọc
        </Button>
      )}
    </div>
  )
}
