'use client'
import { useState, useEffect } from 'react'
import { DataTable } from '@/components/common'
import { columnsEntertainment } from '@/features/entertainment'
import { getEntertainmentPaginated, deleteManyEntertainment, updateMultipleEntertainmentStatus } from '../../services/api'
import type { Entertainment } from '../../types'
import { toast } from 'react-toastify'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash2, Eye, EyeOff } from 'lucide-react'

interface Props {
  refresh: boolean
  callback: () => void
  type: 'movie' | 'music' | 'podcast' | 'series' | 'episode'
  parentId?: string
  onManageEpisodes?: (parentId: string, title: string) => void
}

export default function EntertainmentContent({ refresh, callback, type, parentId, onManageEpisodes }: Props) {
  const [items, setItems] = useState<Entertainment[]>([])
  const [selectedRows, setSelectedRows] = useState<Entertainment[]>([])
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [openPublishDialog, setOpenPublishDialog] = useState(false)
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish')
  const [loadingAction, setLoadingAction] = useState(false)

  const fetchData = async () => {
    const params: any = { page: 1, limit: 100, type: type === 'series' || type === 'episode' ? undefined : type }
    if (parentId) params.parentId = parentId
    await getEntertainmentPaginated(params).then((res) => setItems(res.data))
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, type, parentId])

  const handleDeleteMultiple = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mục để xóa')
      return
    }
    const selected = items.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return

    setIsDeleting(true)
    try {
      const ids = selectedRows.map((row) => String(row._id))
      await deleteManyEntertainment(ids)
      toast.success(`Đã xóa ${ids.length} mục thành công`)
      setSelectedRows([])
      setOpenDeleteDialog(false)
      fetchData()
      callback()
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mục')
      return
    }
    const selected = items.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('publish')
    setOpenPublishDialog(true)
  }

  const handleUnpublishMany = (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một mục')
      return
    }
    const selected = items.filter((item) => ids.includes(String(item._id)))
    setSelectedRows(selected)
    setPublishAction('unpublish')
    setOpenPublishDialog(true)
  }

  const handlePublishManyConfirm = async () => {
    if (selectedRows.length === 0) return
    setLoadingAction(true)
    try {
      const ids = selectedRows.map((row) => String(row._id))
      const newStatus = publishAction === 'publish'
      const res = await updateMultipleEntertainmentStatus(ids, newStatus)
      if (res.success) {
        toast.success(`Đã ${newStatus ? 'hiển thị' : 'ẩn'} ${res.data?.updatedCount || 0} mục`)
        setSelectedRows([])
        setOpenPublishDialog(false)
        fetchData()
        callback()
      }
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <>
      <DataTable
        data={items}
        columns={columnsEntertainment(() => {
          fetchData()
          callback()
        }, onManageEpisodes)}
        columnNameSearch="title"
        handleDeleteMultiple={handleDeleteMultiple}
        handlePublishMultiple={handlePublishMany}
        handleUnpublishMultiple={handleUnpublishMany}
      />

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{selectedRows.length}</strong> mục đã chọn không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenDeleteDialog(false)
                setSelectedRows([])
              }}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMultiple} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openPublishDialog} onOpenChange={setOpenPublishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{publishAction === 'publish' ? 'Hiển thị' : 'Ẩn'} nhiều mục</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn {publishAction === 'publish' ? 'hiển thị' : 'ẩn'} <strong>{selectedRows.length}</strong> mục đã chọn không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenPublishDialog(false)
                setSelectedRows([])
              }}
              disabled={loadingAction}
            >
              Hủy
            </Button>
            <Button variant="default" onClick={handlePublishManyConfirm} disabled={loadingAction}>
              {loadingAction ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {publishAction === 'publish' ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Hiển thị
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ẩn
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

