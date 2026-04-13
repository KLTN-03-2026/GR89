'use client'
import { PlanRow } from './PlansColumn'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil } from "lucide-react"
import { updatePlanStatus } from '@/lib/apis/api'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { SheetUpdatePlan } from '@/features/billing'

interface ActionCellProps {
  plan: PlanRow
  callback: () => void
}

export default function ActionCell({ plan, callback }: ActionCellProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpenUpdatePlan, setIsOpenUpdatePlan] = useState(false)

  const handleToggleStatus = () => {
    setIsLoading(true)
    updatePlanStatus(plan._id)
      .then(() => {
        callback()
        toast.success(plan.isActive ? 'Tạm tắt gói thành công' : 'Kích hoạt gói thành công')
      })
      .catch((error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } }
        toast.error(err?.response?.data?.message || 'Không thể cập nhật trạng thái')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <>
      <SheetUpdatePlan
        callback={callback}
        plan={plan as any}
        open={isOpenUpdatePlan}
        setOpen={setIsOpenUpdatePlan}
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
          <DropdownMenuItem
            onSelect={(e) => { e.preventDefault(); setIsOpenUpdatePlan(true) }}
            disabled={isLoading}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Sửa
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleToggleStatus}
            disabled={isLoading}
          >
            {!plan.isActive ? (
              <Eye className="h-4 w-4 mr-2" />
            ) : (
              <EyeOff className="h-4 w-4 mr-2" />
            )}
            {!plan.isActive ? 'Kích hoạt' : 'Tạm tắt'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

