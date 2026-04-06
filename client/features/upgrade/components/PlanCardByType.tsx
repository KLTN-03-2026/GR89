'use client'
import { DefaultPlanCard } from './DefaultPlanCard'
import { VipPlanCard } from './VipPlanCard'
import { PremiumPlanCard } from './PremiumPlanCard'


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
  displayType?: 'default' | 'vip' | 'premium'
}

interface PlanCardByTypeProps {
  plan: Plan
  onUpgrade?: (planId: string) => void
}

export function PlanCardByType({ plan, onUpgrade }: PlanCardByTypeProps) {
  const displayType = plan.displayType || 'default'

  switch (displayType) {
    case 'vip':
      return <VipPlanCard plan={plan} onUpgrade={onUpgrade} />
    case 'premium':
      return <PremiumPlanCard plan={plan} onUpgrade={onUpgrade} />
    case 'default':
    default:
      return <DefaultPlanCard plan={plan} onUpgrade={onUpgrade} />
  }
}

