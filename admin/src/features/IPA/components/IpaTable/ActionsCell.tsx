'use client'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Loader2, MoreHorizontal, Trash2, Eye, EyeOff, Crown, ListOrdered } from "lucide-react"
import { useState } from 'react'
import { deleteIpa, toggleIpaVipStatus, updateIpaStatus } from '@/features/IPA/services/api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { SheetUpdateIpa } from '@/features/IPA/components/dialogs/SheetUpdateIpa'
import { Ipa } from '../../types'
import DialogConfirmDelete from '../dialogs/DialogConfirmDelete'

interface ActionsCellProps {
  ipa: Ipa
  callback: () => void
}

export default function ActionsCell({ ipa, callback }: ActionsCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const router = useRouter()
  const handleDelete = async () => {
    setIsLoading(true)
    await deleteIpa(ipa._id)
      .then(() => {
        toast.success('Xóa IPA thành công')
        callback()
        setOpenDelete(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleStatus = async () => {
    setIsLoading(true)
    await updateIpaStatus(ipa._id)
      .then(() => {
        toast.success(`Đã ${ipa.isActive ? 'ẩn' : 'xuất bản'} IPA thành công`)
        callback()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleToggleVip = async () => {
    setIsLoading(true)
    await toggleIpaVipStatus(ipa._id)
      .then(() => {
        toast.success(`Đã ${ipa.isVipRequired ? 'tắt' : 'bật'} VIP cho bài học này`)
        callback()
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <>
      {/* Dialog xác nhận xóa */}
      <DialogConfirmDelete
        open={openDelete}
        setOpen={setOpenDelete}
        ipa={ipa}
        handleDelete={handleDelete}
        isLoading={isLoading}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Hành động</DropdownMenuLabel>

          <SheetUpdateIpa ipa={ipa} callback={callback} />

          <DropdownMenuItem onClick={() => router.push(`/content/ipa/examples/${ipa._id}`)}>
            <ListOrdered className="h-4 w-4 mr-2" />
            Danh sách ví dụ
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleToggleStatus}
            disabled={isLoading}
          >
            {ipa.isActive ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Ẩn
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Xuất bản
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleToggleVip}
            disabled={isLoading}
          >
            <Crown className="h-4 w-4 mr-2" />
            {ipa.isVipRequired ? 'Chuyển thành thường' : 'Chuyển thành VIP'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setOpenDelete(true)}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
