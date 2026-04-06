'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Shield, Star, Crown, Sparkles } from 'lucide-react'

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

interface VipPlanCardProps {
  plan: Plan
  onUpgrade?: (planId: string) => void
}

export function VipPlanCard({ plan, onUpgrade }: VipPlanCardProps) {
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

  const finalPrice = plan.originalPrice && plan.originalPrice > plan.price ? plan.originalPrice : plan.price
  const displayPrice = plan.originalPrice && plan.originalPrice > plan.price ? plan.price : plan.price

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-[1.02] relative overflow-hidden">
        {/* VIP Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" />
            <span>VIP</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/30 to-amber-200/30 rounded-full blur-2xl" />

        <CardHeader className="text-center pb-4 relative z-10">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-3xl flex items-center justify-center mb-4 shadow-xl relative">
            <Crown className="w-12 h-12 text-white" />
            <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <CardTitle className="text-4xl font-bold text-gray-900">{plan.name}</CardTitle>
          <CardDescription className="text-lg text-gray-700 font-medium">
            {plan.description || 'Gói VIP độc quyền'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {/* Price */}
          <div className="text-center">
            {plan.originalPrice && plan.originalPrice > plan.price && (
              <div className="mb-2">
                <span className="text-sm text-gray-600 line-through mr-2">
                  {formatPrice(plan.originalPrice)}₫
                </span>
                {plan.discountPercent && (
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-full text-xs font-bold shadow-md">
                    -{plan.discountPercent}%
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-xl text-gray-700 font-semibold">₫{getBillingCycleText()}</span>
            </div>
            {plan.billingCycle === 'yearly' && (
              <p className="text-sm text-amber-700 font-medium mt-2">
                Chỉ {formatPrice(Math.round(displayPrice / 12))}₫/tháng
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onUpgrade?.(plan._id)}
            className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white font-bold py-6 text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <Crown className="w-5 h-5 mr-2" />
            Nâng cấp VIP ngay
          </Button>

          {/* Features */}
          <div className="space-y-3 pt-4 border-t border-amber-200">
            <h4 className="font-bold text-gray-900 text-lg mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Tính năng VIP độc quyền:
            </h4>
            {plan.features && plan.features.length > 0 ? (
              plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center mt-0.5 shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-gray-800 leading-relaxed font-medium">{feature}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600 text-center py-2">Chưa có thông tin tính năng</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guarantee */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 text-base">Đảm bảo hoàn tiền 100%</h4>
              <p className="text-amber-800 text-sm">
                Hoàn tiền trong 3 ngày nếu không hài lòng với dịch vụ VIP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
            ))}
            <span className="text-gray-900 font-bold">5.0/5</span>
          </div>
          <p className="text-gray-800 italic font-medium">
            "Gói VIP thực sự xứng đáng với mức giá. Tính năng độc quyền và hỗ trợ ưu tiên tuyệt vời!"
          </p>
          <p className="text-amber-700 text-sm mt-2 font-semibold">- Thành viên VIP</p>
        </CardContent>
      </Card>
    </div>
  )
}

