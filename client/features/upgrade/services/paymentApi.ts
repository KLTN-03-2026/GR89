'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'

interface CallbackPayment {
  _id?: string
  planId?: string
  amount?: number
  status?: 'paid' | 'failed' | 'pending'
}

export interface PaymentCallbackResponse {
  success: boolean
  message: string
  data?: {
    payment?: CallbackPayment
    paymentId?: string
    amount?: number
    planId?: string
    status?: 'paid' | 'failed' | 'pending'
  }
}

export async function handleVNPayCallback(params: Record<string, string>): Promise<PaymentCallbackResponse> {
  const response = await authorizedAxios.post<PaymentCallbackResponse>('/payment/vnpay/callback', { params })
  return response.data
}
