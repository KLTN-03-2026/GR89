'use client'
import { useAuth } from '@/libs/contexts/AuthContext'
import { createPaymentUrl, type Plan } from '@/features/upgrade/services/upgradeApi'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Crown, Loader2 } from 'lucide-react'
import { PricingDialog } from '@/components/common/upgrades'
import { toast } from 'react-toastify'
import { PlanCard, usePlans } from '@/components/common/Plans'

export function PricingSection() {
  const router = useRouter()
  const { user } = useAuth()
  const { sortedPlans, isLoading } = usePlans()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  const handlePlanClick = (plan: Plan) => {
    if (!user) {
      router.push('/login')
      return
    }
    if (plan.price <= 0) {
      router.push('/dashboard')
      return
    }
    setSelectedPlan(plan)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedPlan(null)
  }

  const resetPaymentState = () => {
    setIsProcessingPayment(false)
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
        setIsDialogOpen(false)
        window.location.href = res.data.paymentUrl
        return
      }

      toast.error(res.message || 'Không thể tạo liên kết thanh toán')
      resetPaymentState()
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err?.response?.data?.message || 'Không thể tạo liên kết thanh toán')
      resetPaymentState()
    }
  }

  if (user?.isVip) {
    return null
  }

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-4">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-semibold">Gói Thành Viên</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Chọn Gói Phù Hợp Với Bạn
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bắt đầu miễn phí, nâng cấp bất kỳ lúc nào. Hủy bất cứ khi nào.
          </p>
        </div>

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="flex items-center gap-3 text-gray-500">
              <span className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              Đang tải gói dịch vụ...
            </div>
          </div>
        ) : sortedPlans.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            Hiện chưa có gói nào khả dụng.
          </div>
        ) : (
          <div className="grid xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {sortedPlans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                onSelect={handlePlanClick}
                size="default"
              />
            ))}
          </div>
        )}
      </div>
      <PricingDialog
        open={isDialogOpen}
        plan={selectedPlan}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        isSubmitting={isProcessingPayment}
      />
      {isProcessingPayment && <PaymentProcessingOverlay />}
    </section>
  )
}

function PaymentProcessingOverlay() {
  return (
    <div className="fixed inset-0 z-[2000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
      <div className="bg-white shadow-2xl rounded-3xl px-10 py-8 flex flex-col items-center gap-4 border border-blue-100">
        <span className="inline-flex p-4 rounded-full bg-blue-50 text-blue-600">
          <Loader2 className="w-10 h-10 animate-spin" />
        </span>
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900">Đang chuyển đến cổng thanh toán</p>
          <p className="text-sm text-gray-500 mt-1">Vui lòng giữ kết nối ổn định và đừng đóng trình duyệt.</p>
        </div>
      </div>
    </div>
  )
}
