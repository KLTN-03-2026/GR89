import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Search, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface props {
    urlSoundType: 'vowel' | 'consonant' | 'diphthong' | undefined
    urlIsActive: boolean | undefined
    urlSortBy: 'sound' | 'soundType' | 'createdAt' | 'updatedAt'
    urlSortOrder: 'asc' | 'desc'
    urlLimit: number
    updateUrl: (updates: Record<string, string | number | boolean | undefined>) => void
    search: string
    setSearch: (value: string) => void
    handleSearch: (value: string) => void
    activeFiltersCount: number
    setShowFilters: (value: boolean) => void
    ipaLength: number
    total: number
}

export default function FiltersPanel({ urlSoundType, urlIsActive, urlSortBy, urlSortOrder, urlLimit, updateUrl, search, setSearch, handleSearch, activeFiltersCount, setShowFilters, ipaLength, total }: props) {
    const router = useRouter()
    const pathname = usePathname()

    const handleSoundTypeFilter = (value: string) => {
        updateUrl({ soundType: value === 'all' ? undefined : value, page: 1 })
    }

    const handleStatusFilter = (value: string) => {
        updateUrl({ isActive: value === 'all' ? undefined : value === 'active', page: 1 })
    }

    const handleSort = (field: 'sound' | 'soundType' | 'createdAt' | 'updatedAt') => {
        const newSortOrder = urlSortBy === field && urlSortOrder === 'asc' ? 'desc' : 'asc'
        updateUrl({ sortBy: field, sortOrder: newSortOrder, page: 1 })
    }

    const handlePageSizeChange = (newLimit: number) => {
        updateUrl({ limit: newLimit, page: 1 })
    }

    const clearAllFilters = () => {
        setSearch("")
        router.push(pathname, { scroll: false })
    }


    return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tìm kiếm</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm theo âm hoặc mô tả..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Sound Type Filter */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Loại âm</label>
                    <Select value={urlSoundType === undefined ? 'all' : urlSoundType} onValueChange={handleSoundTypeFilter}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="vowel">Nguyên âm</SelectItem>
                            <SelectItem value="consonant">Phụ âm</SelectItem>
                            <SelectItem value="diphthong">Nguyên âm đôi</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                    <Select value={urlIsActive === undefined ? 'all' : urlIsActive ? 'active' : 'inactive'} onValueChange={handleStatusFilter}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="active">Đã xuất bản</SelectItem>
                            <SelectItem value="inactive">Chưa xuất bản</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sắp xếp theo</label>
                    <Select value={urlSortBy} onValueChange={(value: 'sound' | 'soundType' | 'createdAt' | 'updatedAt') => handleSort(value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sound">Âm</SelectItem>
                            <SelectItem value="soundType">Loại âm</SelectItem>
                            <SelectItem value="createdAt">Ngày tạo</SelectItem>
                            <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Page Size */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Số lượng/trang</label>
                    <Select value={urlLimit.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5/trang</SelectItem>
                            <SelectItem value="10">10/trang</SelectItem>
                            <SelectItem value="20">20/trang</SelectItem>
                            <SelectItem value="50">50/trang</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Xóa bộ lọc
                    </Button>
                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(false)}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Đóng
                        </Button>
                    )}
                </div>
                <div className="text-sm text-gray-500">
                    Hiển thị {ipaLength} trong {total} kết quả
                </div>
            </div>
        </div>
    )
}