'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export interface Plan {
  _id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  discountPercent?: number
  billingCycle: 'monthly' | 'yearly' | 'lifetime'
  features: string[]
  currency?: string
  isActive: boolean
  sortOrder: number
  displayType: 'default' | 'vip' | 'premium'
  validFrom?: string
  validTo?: string
  createdAt: string
  updatedAt: string
}

export interface ValidateCouponResponse {
  coupon: {
    code: string
    name: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
  }
  discountAmount: number
  finalAmount: number
}

export interface CreatePaymentResponse {
  paymentUrl: string
  paymentId: string
}

export async function getActivePlans(displayType?: 'default' | 'vip' | 'premium'): Promise<ApiResponse<Plan[]>> {
  const params = displayType ? { displayType } : {}
  const response = await authorizedAxios.get<ApiResponse<Plan[]>>('/plan/active', { params })
  return response.data
}

export async function validateCoupon(
  code: string,
  planId: string,
  amount: number
): Promise<ApiResponse<ValidateCouponResponse>> {
  const params = new URLSearchParams({ code, planId, amount: String(amount) })
  const response = await authorizedAxios.get<ApiResponse<ValidateCouponResponse>>(
    `/coupon/validate?${params.toString()}`
  )
  return response.data
}

export async function createPaymentUrl(body: {
  planId: string
  couponCode?: string
}): Promise<ApiResponse<CreatePaymentResponse>> {
  const response = await authorizedAxios.post<ApiResponse<CreatePaymentResponse>>('/payment/create-url', body)
  return response.data
}
