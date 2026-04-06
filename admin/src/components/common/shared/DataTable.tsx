"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"

// Removed unused table component imports - using native HTML elements for better control
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Eye,
  EyeOff,
  Inbox,
  Loader2,
  Search,
  Trash2,
} from "lucide-react"
import { useState, useEffect } from "react"

interface DataTableProps<TData extends { _id: string }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  isLoading?: boolean
  columnNameSearch: string
  handleDeleteMultiple?: (ids: string[]) => void
  handlePublishMultiple?: (ids: string[]) => void
  handleUnpublishMultiple?: (ids: string[]) => void
  maxHeight?: string // Thêm prop để control chiều cao
  initialColumnVisibility?: VisibilityState
  // New optional props for server-side pagination/search
  serverSidePagination?: boolean
  pagination?: { page: number; limit: number; total: number; pages: number }
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onSearch?: (value: string) => void
  onSelectedRowsChange?: (rows: TData[]) => void
}

export function DataTable<TData extends { _id: string }, TValue>({
  columns,
  data,
  isLoading,
  columnNameSearch,
  handleDeleteMultiple,
  handlePublishMultiple,
  handleUnpublishMultiple,
  maxHeight = "500px", // Default height
  initialColumnVisibility,
  serverSidePagination = false,
  pagination,
  onPageChange,
  onLimitChange,
  onSearch,
  onSelectedRowsChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>(initialColumnVisibility || {})
  const [rowSelection, setRowSelection] = useState({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [hasUserResizedColumns, setHasUserResizedColumns] = useState(false)

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: (updater) => {
      setHasUserResizedColumns(true)
      setColumnSizing(updater)
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnSizing,
    },
    manualPagination: serverSidePagination,
    pageCount: serverSidePagination ? pagination?.pages : undefined,
    getRowId: (row: TData) => row._id,
  })

  // Reset selection when data changes (for server-side pagination)
  useEffect(() => {
    if (serverSidePagination && data.length > 0) {
      // Only reset if current selection IDs don't exist in new data
      const currentSelectedIds = Object.keys(rowSelection)
      const newDataIds = data.map(row => row._id)
      const hasInvalidSelection = currentSelectedIds.some(id => !newDataIds.includes(id))
      if (hasInvalidSelection) {
        setRowSelection({})
      }
    }
  }, [data, serverSidePagination, rowSelection])

  // Callback when row selection changes
  useEffect(() => {
    if (onSelectedRowsChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
      onSelectedRowsChange(selectedRows)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  return (
    <div className="w-full space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!serverSidePagination && (
          <div className="relative w-full max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder={`Tìm kiếm ${columnNameSearch}…`}
              value={(table.getColumn(columnNameSearch)?.getFilterValue() as string) ?? ""}
              onChange={(event) => {
                if (onSearch) {
                  onSearch(event.target.value)
                } else {
                  table.getColumn(columnNameSearch)?.setFilterValue(event.target.value)
                }
              }}
              className="h-10 border-border bg-background pl-9 shadow-none transition-[box-shadow,border-color] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 sm:ml-auto">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-sm font-medium text-foreground">
                <span className="tabular-nums text-primary">
                  {table.getFilteredSelectedRowModel().rows.length}
                </span>
                <span className="text-muted-foreground">đã chọn</span>
              </div>
              {handlePublishMultiple && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-emerald-200/80 bg-background text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 dark:border-emerald-800/50 dark:text-emerald-200 dark:hover:bg-emerald-950/40"
                  onClick={() =>
                    handlePublishMultiple(
                      table.getFilteredSelectedRowModel().rows.map((row) => String(row.original._id))
                    )
                  }
                >
                  <Eye className="h-4 w-4" />
                  Xuất bản
                </Button>
              )}
              {handleUnpublishMultiple && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-amber-200/80 bg-background text-amber-900 hover:bg-amber-50 dark:border-amber-800/50 dark:text-amber-200 dark:hover:bg-amber-950/40"
                  onClick={() =>
                    handleUnpublishMultiple(
                      table.getFilteredSelectedRowModel().rows.map((row) => String(row.original._id))
                    )
                  }
                >
                  <EyeOff className="h-4 w-4" />
                  Ẩn
                </Button>
              )}
              {handleDeleteMultiple && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    handleDeleteMultiple(
                      table.getFilteredSelectedRowModel().rows.map((row) => String(row.original._id))
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </Button>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border bg-background shadow-sm"
              >
                <Columns3 className="h-4 w-4 text-muted-foreground" />
                Cột
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[12rem]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div
        className="relative overflow-auto rounded-xl border border-border bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
        style={{ maxHeight }}
      >
        <table className={`w-full caption-bottom text-sm ${hasUserResizedColumns ? "table-fixed" : "table-auto"}`}>
          <thead className="sticky top-0 z-50 border-b border-border bg-muted/90 backdrop-blur-md supports-[backdrop-filter]:bg-muted/75">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="transition-colors"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      style={hasUserResizedColumns ? { width: header.getSize() } : undefined}
                      className="relative h-11 px-4 text-left align-middle text-[13px] font-semibold tracking-tight text-foreground/85 first:pl-5 last:pr-5 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                      {/* Resize handle */}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={(e) => {
                            setHasUserResizedColumns(true)
                            header.getResizeHandler()(e)
                          }}
                          onTouchStart={(e) => {
                            setHasUserResizedColumns(true)
                            header.getResizeHandler()(e)
                          }}
                          className={[
                            "absolute right-0 top-0 h-full w-2 cursor-col-resize select-none touch-none",
                            "after:absolute after:right-0 after:top-1/2 after:h-6 after:w-px after:-translate-y-1/2 after:bg-border",
                            header.column.getIsResizing() ? "after:bg-primary after:w-0.5" : "",
                          ].join(" ")}
                          title="Kéo để đổi độ rộng cột"
                        />
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          {isLoading ? (
            <tbody>
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Đang tải dữ liệu…</p>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table.getFilteredRowModel().rows?.length ? (
                table.getFilteredRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={[
                      "border-b border-border/60 transition-colors duration-150",
                      "truncate text-wrap",
                      idx % 2 === 0 ? "bg-card" : "bg-muted/35",
                      row.getIsSelected()
                        ? "bg-primary/8 hover:bg-primary/12 border-l-[3px] border-l-primary"
                        : "hover:bg-muted/60",
                    ].join(" ")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={hasUserResizedColumns ? { width: cell.column.getSize() } : undefined}
                        className="px-4 py-[0.85rem] align-middle text-sm text-foreground/90 first:pl-5 last:pr-5 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-4 py-14">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
                        <Inbox className="h-7 w-7 text-muted-foreground/70" strokeWidth={1.5} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground">Không có dữ liệu</p>
                        <p className="mt-1 text-xs text-muted-foreground">Thử đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-stretch gap-4 rounded-xl border border-border bg-muted/25 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {serverSidePagination && pagination ? (
              pagination.total > 0 ? (
                <>
                  Hiển thị{" "}
                  <span className="tabular-nums font-semibold text-foreground">
                    {((pagination.page - 1) * pagination.limit) + 1}
                  </span>
                  {" – "}
                  <span className="tabular-nums font-semibold text-foreground">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  trong{" "}
                  <span className="tabular-nums font-semibold text-foreground">{pagination.total}</span> bản ghi
                </>
              ) : (
                "Không có dữ liệu"
              )
            ) : (
              <>
                <span className="tabular-nums font-semibold text-foreground">
                  {table.getFilteredSelectedRowModel().rows.length}
                </span>
                {" / "}
                <span className="tabular-nums font-semibold text-foreground">
                  {table.getFilteredRowModel().rows.length}
                </span>{" "}
                đã chọn
              </>
            )}
          </div>
          {serverSidePagination && pagination && onLimitChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Số dòng / trang</span>
              <Select
                value={String(pagination.limit)}
                onValueChange={(value) => {
                  onLimitChange(Number(value))
                  onPageChange?.(1) // Reset về trang 1 khi đổi limit
                }}
              >
                <SelectTrigger className="h-9 w-[80px] border-border bg-background shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {serverSidePagination && pagination ? (
            <>
              {/* First page button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(1)}
                disabled={pagination.page <= 1}
                className="h-9 w-9 p-0 border-border bg-background shadow-none transition-all hover:bg-muted disabled:opacity-40"
                title="Trang đầu"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>

              {/* Previous page button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="h-9 w-9 p-0 border-border bg-background shadow-none transition-all hover:bg-muted disabled:opacity-40"
                title="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const currentPage = pagination.page
                  const totalPages = pagination.pages || 1
                  const pagesToShow: (number | string)[] = []

                  if (totalPages <= 7) {
                    // Hiển thị tất cả các trang nếu <= 7
                    for (let i = 1; i <= totalPages; i++) {
                      pagesToShow.push(i)
                    }
                  } else {
                    // Logic hiển thị trang với ellipsis
                    if (currentPage <= 3) {
                      // Trang đầu: 1, 2, 3, 4, ..., last
                      for (let i = 1; i <= 4; i++) {
                        pagesToShow.push(i)
                      }
                      pagesToShow.push('...')
                      pagesToShow.push(totalPages)
                    } else if (currentPage >= totalPages - 2) {
                      // Trang cuối: 1, ..., n-3, n-2, n-1, n
                      pagesToShow.push(1)
                      pagesToShow.push('...')
                      for (let i = totalPages - 3; i <= totalPages; i++) {
                        pagesToShow.push(i)
                      }
                    } else {
                      // Trang giữa: 1, ..., current-1, current, current+1, ..., last
                      pagesToShow.push(1)
                      pagesToShow.push('...')
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pagesToShow.push(i)
                      }
                      pagesToShow.push('...')
                      pagesToShow.push(totalPages)
                    }
                  }

                  return pagesToShow.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                          ...
                        </span>
                      )
                    }
                    const pageNum = page as number
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange?.(pageNum)}
                        className={`h-9 w-9 p-0 font-semibold transition-all ${currentPage === pageNum
                            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                            : "border-border bg-background shadow-none hover:bg-muted"
                          }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })
                })()}
              </div>

              {/* Next page button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.pages || pagination.page >= pagination.pages}
                className="h-9 w-9 p-0 border-border bg-background shadow-none transition-all hover:bg-muted disabled:opacity-40"
                title="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Last page button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.pages || 1)}
                disabled={!pagination.pages || pagination.page >= pagination.pages}
                className="h-9 w-9 p-0 border-border bg-background shadow-none transition-all hover:bg-muted disabled:opacity-40"
                title="Trang cuối"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>

              {/* Page info */}
              <div className="ml-1 rounded-lg border border-border bg-background px-3 py-1.5 tabular-nums">
                <span className="text-sm font-semibold text-foreground">
                  Trang {pagination.page} / {pagination.pages || 1}
                </span>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 gap-2 border-border bg-background shadow-none transition-all hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 gap-2 border-border bg-background shadow-none transition-all hover:bg-muted disabled:opacity-40"
              >
                Sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
