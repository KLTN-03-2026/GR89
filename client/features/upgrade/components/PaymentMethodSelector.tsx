'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PaymentMethod {
  id: string
  name: string
  icon: string
  popular: boolean
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[]
  selectedPayment: string
  onPaymentChange: (methodId: string) => void
}

export function PaymentMethodSelector({
  methods,
  selectedPayment,
  onPaymentChange
}: PaymentMethodSelectorProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Chọn phương thức thanh toán</CardTitle>
        <CardDescription className="text-gray-600">
          Chọn phương thức thanh toán phù hợp với bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {methods.map((method) => (
            <div
              key={method.id}
              onClick={() => onPaymentChange(method.id)}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedPayment === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{method.icon}</span>
                  <span className="font-medium text-gray-900 text-lg">{method.name}</span>
                </div>
                {method.popular && (
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                    Phổ biến
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

