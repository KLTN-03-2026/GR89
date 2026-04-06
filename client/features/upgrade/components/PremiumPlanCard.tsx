'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Shield, Star, Sparkles, Gem } from 'lucide-react'

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

interface PremiumPlanCardProps {
  plan: Plan
  onUpgrade?: (planId: string) => void
}

export function PremiumPlanCard({ plan, onUpgrade }: PremiumPlanCardProps) {
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
      <Card className="bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 border-2 border-purple-400 shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02] relative overflow-hidden">
        {/* Premium Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 animate-pulse">
            <Gem className="w-4 h-4" />
            <span>PREMIUM</span>
          </div>
        </div>

        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl" />
        </div>

        <CardHeader className="text-center pb-4 relative z-10">
          <div className="mx-auto w-28 h-28 bg-gradient-to-br from-purple-400 via-pink-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-4 shadow-2xl relative">
            <Gem className="w-14 h-14 text-white" />
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-purple-300 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-1 w-4 h-4 text-pink-300 animate-pulse delay-500" />
          </div>
          <CardTitle className="text-4xl font-bold text-white drop-shadow-lg">{plan.name}</CardTitle>
          <CardDescription className="text-lg text-purple-200 font-medium">
            {plan.description || 'Gói Premium cao cấp nhất'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          {/* Price */}
          <div className="text-center">
            {plan.originalPrice && plan.originalPrice > plan.price && (
              <div className="mb-2">
                <span className="text-sm text-purple-300 line-through mr-2">
                  {formatPrice(plan.originalPrice)}₫
                </span>
                {plan.discountPercent && (
                  <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                    -{plan.discountPercent}%
                  </span>
                )}
              </div>
            )}
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200">
                {formatPrice(displayPrice)}
              </span>
              <span className="text-xl text-purple-200 font-semibold">₫{getBillingCycleText()}</span>
            </div>
            {plan.billingCycle === 'yearly' && (
              <p className="text-sm text-purple-300 font-medium mt-2">
                Chỉ {formatPrice(Math.round(displayPrice / 12))}₫/tháng
              </p>
            )}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onUpgrade?.(plan._id)}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-7 text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all border-2 border-purple-300/50"
          >
            <Gem className="w-5 h-5 mr-2" />
            Nâng cấp Premium ngay
          </Button>

          {/* Features */}
          <div className="space-y-3 pt-4 border-t border-purple-400/30">
            <h4 className="font-bold text-white text-lg mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-300" />
              Tính năng Premium độc quyền:
            </h4>
            {plan.features && plan.features.length > 0 ? (
              plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mt-0.5 shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-purple-100 leading-relaxed font-medium">{feature}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-purple-300 text-center py-2">Chưa có thông tin tính năng</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guarantee */}
      <Card className="bg-gradient-to-r from-purple-900 to-indigo-900 border-2 border-purple-400 shadow-xl">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Đảm bảo hoàn tiền 100%</h4>
              <p className="text-purple-200 text-sm">
                Hoàn tiền trong 7 ngày nếu không hài lòng với dịch vụ Premium
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 border-purple-400/50 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="text-white font-bold">5.0/5</span>
          </div>
          <p className="text-purple-100 italic font-medium">
            "Gói Premium là lựa chọn tốt nhất! Mọi tính năng đều vượt quá mong đợi. Đáng giá từng đồng!"
          </p>
          <p className="text-purple-300 text-sm mt-2 font-semibold">- Thành viên Premium</p>
        </CardContent>
      </Card>
    </div>
  )
}

