'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import type { Plan } from '@/features/upgrade/services/upgradeApi'
import { formatCurrency, getBillingCycleText, isHighlightedPlan } from './planUtils'

interface PlanCardProps {
  plan: Plan
  onSelect: (plan: Plan) => void
  size?: 'default' | 'compact'
}

export function PlanCard({ plan, onSelect, size = 'default' }: PlanCardProps) {
  const highlighted = isHighlightedPlan(plan)
  const isFreePlan = plan.price <= 0
  const savings =
    plan.originalPrice && plan.originalPrice > plan.price
      ? plan.originalPrice - plan.price
      : 0
  const monthlyEquivalent =
    plan.billingCycle === 'yearly' ? Math.round(plan.price / 12) : null

  const isCompact = size === 'compact'

  return (
    <div
      className={`relative rounded-2xl transition-all duration-300 cursor-pointer ${
        isCompact
          ? `p-6 ${highlighted
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl border-2 border-blue-400'
              : 'bg-white border-2 border-gray-200 hover:shadow-lg hover:border-blue-300'
            }`
          : `mx-auto max-w-lg w-full p-8 ${highlighted
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl transform scale-105'
              : 'bg-white border-2 border-gray-200 hover:shadow-xl'
            }`
      }`}
      onClick={() => onSelect(plan)}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ⚡ Được khuyên dùng
          </div>
        </div>
      )}

      <div className={`flex justify-center ${isCompact ? 'mb-4' : 'mb-6'}`}>
        <div
          className={`${
            isFreePlan
              ? 'px-4 py-2 bg-blue-500 rounded-full'
              : `${isCompact ? 'w-12 h-12' : 'w-16 h-16'} flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600`
          } text-white shadow-lg`}
        >
          {isFreePlan ? (
            <span className={`${isCompact ? 'text-sm' : 'text-sm'} font-bold tracking-wider`}>FREE</span>
          ) : (
            <span className={isCompact ? 'text-2xl' : 'text-3xl'}>👑</span>
          )}
        </div>
      </div>

      <h3
        className={`${isCompact ? 'text-xl' : 'text-3xl'} font-bold ${isCompact ? 'mb-2' : 'mb-2'} text-center ${
          highlighted ? 'text-white' : 'text-gray-900'
        }`}
      >
        {plan.name}
      </h3>
      <p
        className={`${isCompact ? 'text-xs' : 'text-sm'} ${isCompact ? 'mb-4' : 'mb-6'} text-center ${
          highlighted ? 'text-blue-100' : 'text-gray-600'
        }`}
      >
        {plan.description || 'Gói học tập dành cho bạn'}
      </p>

      <div className={`${isCompact ? 'mb-4' : 'mb-6'} text-center`}>
        {savings > 0 && (
          <div className="mb-2">
            <span
              className={`inline-block ${isCompact ? 'px-2 py-1' : 'px-3 py-1'} rounded-full text-xs font-semibold ${
                highlighted
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              Tiết kiệm {formatCurrency(savings)}
            </span>
          </div>
        )}
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={`${isCompact ? 'text-3xl' : 'text-5xl'} font-bold ${
              highlighted ? 'text-white' : 'text-gray-900'
            }`}
          >
            {formatCurrency(plan.price)}
          </span>
          <span className={`${isCompact ? 'text-sm' : 'text-lg'} ${highlighted ? 'text-blue-100' : 'text-gray-600'}`}>
            {getBillingCycleText(plan)}
          </span>
        </div>
                      {monthlyEquivalent && (
                        <p className={`${isCompact ? 'text-xs mt-1' : 'text-sm mt-2'} ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                          Chỉ {formatCurrency(monthlyEquivalent)} / tháng
                        </p>
                      )}
      </div>

      <Button
        className={`w-full ${isCompact ? 'mb-4 font-semibold py-3 text-sm' : 'mb-6 font-bold py-6 text-base'} ${
          highlighted
            ? 'bg-white text-blue-600 hover:bg-blue-50'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isFreePlan ? 'Bắt đầu miễn phí' : isCompact ? 'Chọn gói này' : 'Nâng cấp ngay'}
      </Button>

      <ul className={isCompact ? 'space-y-2' : 'space-y-3'}>
        {plan.features?.length ? (
          plan.features.slice(0, isCompact ? 5 : undefined).map((feature, featureIdx) => (
            <li key={featureIdx} className={`flex items-start ${isCompact ? 'gap-2' : 'gap-3'}`}>
              <div
                className={`flex-shrink-0 ${isCompact ? 'w-4 h-4' : 'w-5 h-5'} rounded-full flex items-center justify-center mt-0.5 ${
                  highlighted ? 'bg-white/20' : 'bg-blue-100'
                }`}
              >
                <Check className={`w-3 h-3 ${highlighted ? 'text-white' : 'text-blue-600'}`} />
              </div>
              <span
                className={`${isCompact ? 'text-xs' : 'text-sm'} leading-relaxed ${
                  highlighted ? 'text-white' : 'text-gray-700'
                }`}
              >
                {feature}
              </span>
            </li>
          ))
        ) : (
          <li className={`${isCompact ? 'text-xs' : 'text-sm'} ${highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
            Thông tin tính năng đang cập nhật
          </li>
        )}
      </ul>
    </div>
  )
}

