import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import { Label } from "@/components/ui/label"

interface UserScoresFiltersProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  showFilters: boolean
  setShowFilters: (value: boolean) => void
  isActive: boolean | undefined
  handleStatusFilter: (value: string) => void
  sortBy: "totalPoints" | "fullName" | "email" | "createdAt"
  handleSort: (field: string) => void
  sortOrder: "asc" | "desc"
  setSortOrder: (value: "asc" | "desc") => void
  limit: number
  handlePageSizeChange: (newLimit: number) => void
  page: number
  total: number
  clearAllFilters: () => void
}

export function UserScoresFilters({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  isActive,
  handleStatusFilter,
  sortBy,
  handleSort,
  sortOrder,
  setSortOrder,
  limit,
  handlePageSizeChange,
  page,
  total,
  clearAllFilters,
}: UserScoresFiltersProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {isActive !== undefined && (
                  <Badge variant="secondary" className="ml-1">
                    1
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Trạng thái</Label>
                <Select value={isActive === undefined ? "all" : isActive ? "active" : "inactive"} onValueChange={handleStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="inactive">Tạm khóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Sắp xếp theo</Label>
                <Select value={sortBy} onValueChange={(value) => handleSort(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trường sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totalPoints">Tổng điểm</SelectItem>
                    <SelectItem value="fullName">Tên</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Thứ tự</Label>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thứ tự" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Tăng dần</SelectItem>
                    <SelectItem value="desc">Giảm dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Hiển thị:</Label>
              <Select value={limit.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">/trang</span>
            </div>

            <div className="text-sm text-muted-foreground">
              Hiển thị {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} trong {total} kết quả
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

