'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/libs/contexts/AuthContext'
import { type Plan, createPaymentUrl } from '@/features/upgrade/services/upgradeApi'
import { useState } from 'react'
import { Crown, Loader2 } from 'lucide-react'
import { PricingDialog } from './PricingDialog'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { PlanCard, usePlans } from '@/components/common/Plans'

interface UpgradeDialogProps {
  open: boolean
  onClose: () => void
  onUpgradeSuccess?: () => void
}

export function UpgradeDialog({ open, onClose, onUpgradeSuccess }: UpgradeDialogProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { sortedPlans, isLoading } = usePlans(open)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handlePlanClick = (plan: Plan) => {
    if (!user) {
      router.push('/login')
      onClose()
      return
    }
    if (plan.price <= 0) {
      router.push('/dashboard')
      onClose()
      return
    }
    setSelectedPlan(plan)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedPlan(null)
  }

  const handleDialogConfirm = async ({ planId, coupon }: { planId: string; coupon?: string }) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      setIsProcessingPayment(true)
      const res = await createPaymentUrl({
        planId,
        couponCode: coupon,
        returnUrl: `${window.location.origin}/payment/callback`
      })

      if (res.success && res.data?.paymentUrl) {
        onUpgradeSuccess?.()
        window.location.href = res.data.paymentUrl
      } else {
        toast.error(res.message || 'Không thể tạo liên kết thanh toán')
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Không thể tạo liên kết thanh toán')
    } finally {
      setIsProcessingPayment(false)
      setIsDialogOpen(false)
      setSelectedPlan(null)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Nâng cấp tài khoản
            </DialogTitle>
            <DialogDescription>
              Chọn gói phù hợp với bạn để mở khóa tất cả tính năng học tập
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải gói dịch vụ...
              </div>
            </div>
          ) : sortedPlans.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Hiện chưa có gói nào khả dụng.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {sortedPlans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onSelect={handlePlanClick}
                  size="compact"
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PricingDialog
        open={isDialogOpen}
        plan={selectedPlan}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        isSubmitting={isProcessingPayment}
      />
    </>
  )
}

