'use client'
import { Card, CardContent } from '@/components/ui/card'

export type BillingCycle = 'monthly' | 'yearly'

interface PlanSelectorProps {
  billingCycle: BillingCycle
  onBillingCycleChange: (cycle: BillingCycle) => void
  monthlyPrice: number
  yearlyPrice: number
}

export function PlanSelector({
  billingCycle,
  onBillingCycleChange,
  monthlyPrice,
  yearlyPrice
}: PlanSelectorProps) {
  const monthlyTotal = monthlyPrice
  const yearlyTotal = yearlyPrice
  const monthlyEquivalent = Math.round(yearlyPrice / 12)
  const savings = monthlyPrice * 12 - yearlyPrice

  return (
    <Card className="bg-white border-2 border-blue-200 shadow-xl">
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Chọn gói đăng ký</h3>
          <p className="text-gray-600">Chọn gói phù hợp với nhu cầu của bạn</p>
        </div>

        {/* Plan Options */}
        <div className="grid gap-4">
          {/* Monthly Plan */}
          <div
            onClick={() => onBillingCycleChange('monthly')}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              billingCycle === 'monthly'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg text-gray-900">Gói hàng tháng</h4>
                  {billingCycle === 'monthly' && (
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                      Đang chọn
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {monthlyPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-gray-600">/tháng</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Thanh toán hàng tháng • Hủy bất cứ lúc nào</p>
              </div>
            </div>
          </div>

          {/* Yearly Plan */}
          <div
            onClick={() => onBillingCycleChange('yearly')}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all relative ${
              billingCycle === 'yearly'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {billingCycle === 'yearly' && (
              <div className="absolute -top-3 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                Tiết kiệm {savings.toLocaleString('vi-VN')}đ/năm
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg text-gray-900">Gói hàng năm</h4>
                  {billingCycle === 'yearly' && (
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                      Đang chọn
                    </span>
                  )}
                  {billingCycle !== 'yearly' && (
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                      Khuyến mãi
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {yearlyPrice.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="text-gray-600">/năm</span>
                </div>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-500">
                    Chỉ {monthlyEquivalent.toLocaleString('vi-VN')}đ/tháng • Tiết kiệm {savings.toLocaleString('vi-VN')}đ/năm
                  </p>
                  {billingCycle !== 'yearly' && (
                    <p className="text-xs text-green-600 font-medium">
                      💰 Giảm {Math.round((savings / (monthlyPrice * 12)) * 100)}% so với gói tháng
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

