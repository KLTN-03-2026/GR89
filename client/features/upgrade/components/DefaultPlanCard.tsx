'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Shield } from 'lucide-react'

interface Plan {
  _id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  discountPercent?: number
  billingCycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  currency?: string
}

interface DefaultPlanCardProps {
  plan: Plan
  onUpgrade?: (planId: string) => void
}

export function DefaultPlanCard({ plan, onUpgrade }: DefaultPlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const getBillingCycleText = () => {
    switch (plan.billingCycle) {
      case 'monthly':
        return '/tháng'
      case 'yearly':
        return '/năm'
      case 'lifetime':
        return 'một lần'
      default:
        return ''
    }
  }

  const displayPrice = plan.originalPrice && plan.originalPrice > plan.price ? plan.price : plan.price

  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-shadow">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl">📘</span>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">{plan.name}</CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {plan.description || 'Gói nâng cấp tiêu chuẩn'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="text-center">
            {plan.originalPrice && plan.originalPrice > plan.price && (
              <div className="mb-2">
                <span className="text-sm text-gray-500 line-through mr-2">
                  {formatPrice(plan.originalPrice)}₫
                </span>
                {plan.discountPercent && (
                  <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                    -{plan.discountPercent}%
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
              <span className="text-lg text-gray-600">₫{getBillingCycleText()}</span>
            </div>
            {plan.billingCycle === 'yearly' && (
              <p className="text-sm text-gray-500 mt-2">
                Chỉ {formatPrice(Math.round(displayPrice / 12))}₫/tháng
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onUpgrade?.(plan._id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-base shadow-lg"
          >
            Nâng cấp ngay
          </Button>

          {/* Features */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-gray-900 text-base mb-3">Tính năng bao gồm:</h4>
            {plan.features && plan.features.length > 0 ? (
              plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <Check className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">Chưa có thông tin tính năng</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guarantee */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 text-sm">Đảm bảo hoàn tiền 100%</h4>
              <p className="text-blue-700 text-xs">
                Hoàn tiền trong 3 ngày nếu không hài lòng
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

