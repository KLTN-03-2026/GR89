'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, TicketPercent, AlertTriangle, XCircle, Loader2 } from 'lucide-react'
import { type Plan, validateCoupon } from '@/features/upgrade/services/upgradeApi'

interface PricingDialogProps {
  open: boolean
  plan: Plan | null
  onClose: () => void
  onConfirm: (params: { planId: string; coupon?: string }) => void
  isSubmitting: boolean
}

export function PricingDialog({ open, plan, onClose, onConfirm, isSubmitting }: PricingDialogProps) {
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [discountSummary, setDiscountSummary] = useState<{ discount: number; finalAmount: number } | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const resetStates = () => {
    setCouponCode('')
    setCouponError(null)
    setDiscountSummary(null)
    setIsValidating(false)
  }

  const handleClose = () => {
    resetStates()
    onClose()
  }

  const formatCurrency = (value: number) => {
    if (value <= 0) return '0đ'
    const roundedToThousand = Math.round(value / 1000) * 1000
    return `${roundedToThousand.toLocaleString('vi-VN')}đ`
  }

  const handleConfirm = () => {
    if (!plan || isSubmitting) return
    onConfirm({
      planId: plan._id,
      coupon: couponCode.trim() || undefined
    })
  }

  useEffect(() => {
    if (!plan) return

    if (!couponCode.trim()) {
      setCouponError(null)
      setDiscountSummary(null)
      setIsValidating(false)
      return
    }

    setIsValidating(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await validateCoupon(couponCode.trim(), plan._id, plan.price)
        if (res.success && res.data) {
          setDiscountSummary({
            discount: res.data.discountAmount,
            finalAmount: res.data.finalAmount
          })
          setCouponError(null)
        } else {
          setDiscountSummary(null)
          setCouponError(res.message || 'Mã giảm giá không hợp lệ')
        }
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } }
        setDiscountSummary(null)
        setCouponError(err?.response?.data?.message || 'Mã giảm giá không hợp lệ')
      } finally {
        setIsValidating(false)
      }
    }, 1000)

    return () => clearTimeout(timeout)
  }, [couponCode, plan])

  if (!plan) return null

  return (
    <Dialog open={open} onOpenChange={(state) => !state && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nhập mã giảm giá</DialogTitle>
          <DialogDescription>
            Xác nhận nâng cấp gói <span className="font-semibold">{plan.name}</span>. Nếu bạn có mã ưu đãi, hãy nhập bên dưới trước khi thanh toán.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-blue-50/60 border-blue-100 p-4 flex flex-col gap-1">
            <div className="text-sm uppercase tracking-wide text-blue-500 font-semibold">Gói chọn</div>
            <div className="text-lg font-bold text-gray-900">{plan.name}</div>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-400" />
              {formatCurrency(plan.price)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coupon" className="flex items-center gap-2 text-gray-700">
              <TicketPercent className="h-4 w-4 text-blue-500" />
              Mã giảm giá (nếu có)
            </Label>
            <Input
              id="coupon"
              placeholder="Nhập mã ưu đãi của bạn"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="h-11 border-blue-200 focus-visible:ring-blue-200/80"
            />
            <p className="text-xs text-gray-500">
              Để trống nếu bạn không có mã. {isValidating && <span className="text-blue-600">Đang kiểm tra...</span>}
            </p>
            {couponError && (
              <div className="flex items-center gap-2 text-sm text-red-600 mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertTriangle className="h-4 w-4" />
                {couponError}
              </div>
            )}
            {discountSummary && (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <div className="flex justify-between">
                  <span>Giảm:</span>
                  <span className="font-semibold">- {formatCurrency(discountSummary.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thành tiền:</span>
                  <span className="font-bold text-lg">{formatCurrency(discountSummary.finalAmount)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            <XCircle className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang chuyển...
              </span>
            ) : (
              'Tiếp tục thanh toán'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

