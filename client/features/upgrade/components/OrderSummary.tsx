'use client'
import type { BillingCycle } from './PlanSelector'

interface OrderSummaryProps {
  billingCycle: BillingCycle
  price: number
}

export function OrderSummary({ billingCycle, price }: OrderSummaryProps) {
  const periodText = billingCycle === 'monthly' ? '1 tháng' : '1 năm'
  const vat = 0
  const total = price

  return (
    <div className="bg-gray-50 p-6 rounded-xl space-y-3">
      <h4 className="font-semibold text-gray-900 text-lg mb-4">Tóm tắt đơn hàng</h4>
      <div className="flex justify-between text-gray-600">
        <span>Gói Pro ({periodText})</span>
        <span className="font-medium">{price.toLocaleString('vi-VN')}đ</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Thuế VAT</span>
        <span className="font-medium">{vat.toLocaleString('vi-VN')}đ</span>
      </div>
      <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-xl">
        <span className="text-gray-900">Tổng cộng</span>
        <span className="text-blue-600">{total.toLocaleString('vi-VN')}đ</span>
      </div>
    </div>
  )
}

