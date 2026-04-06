import type { Plan } from '@/features/upgrade/services/upgradeApi'

export function formatCurrency(value: number): string {
  if (value <= 0) return '0đ'
  const roundedToThousand = Math.round(value / 1000) * 1000
  return `${roundedToThousand.toLocaleString('vi-VN')}đ`
}

export function getBillingCycleText(plan: Plan): string {
  switch (plan.billingCycle) {
    case 'monthly':
      return '/tháng'
    case 'yearly':
      return '/năm'
    case 'lifetime':
      return 'trọn đời'
    default:
      return ''
  }
}

export function isHighlightedPlan(plan: Plan): boolean {
  return plan.displayType === 'premium' || plan.billingCycle === 'yearly'
}

