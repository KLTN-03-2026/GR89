'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Crown, Shield, Star } from 'lucide-react'

interface PlanCardProps {
  features: string[]
}

export function PlanCard({ features }: PlanCardProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-blue-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-4xl font-bold text-gray-900">Gói Pro</CardTitle>
          <CardDescription className="text-xl text-gray-600">
            Dành cho người học nghiêm túc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg mb-4">Tất cả tính năng Pro:</h4>
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guarantee */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-green-800 text-lg">Đảm bảo hoàn tiền 100%</h4>
              <p className="text-green-700">
                Hoàn tiền trong 3 ngày nếu không hài lòng với dịch vụ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
            <span className="text-gray-900 font-semibold">4.9/5</span>
          </div>
          <p className="text-gray-700 italic">
            "Gói Pro đã giúp tôi cải thiện tiếng Anh một cách đáng kể.
            AI Assistant rất hữu ích và các bài học rất chất lượng!"
          </p>
          <p className="text-gray-500 text-sm mt-2">- Nguyễn Văn A, Học viên Pro</p>
        </CardContent>
      </Card>
    </div>
  )
}

