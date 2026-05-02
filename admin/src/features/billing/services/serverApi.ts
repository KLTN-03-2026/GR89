import 'server-only'
import { fetchServer } from '@/lib/apis/fetch-server'
import { CouponQueryParams, Payment, PaymentPaginationMeta, PaymentQueryParams, PlanQueryParams } from '@/lib/apis/api'

/*=============================================================================
 * DANH SÁCH API SERVER-SIDE CHO BILLING
 *============================================================================*/

// 1. Coupons (Mã giảm giá)
export async function getCouponsServer(params?: CouponQueryParams) {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))

  const url = `/coupon?${queryParams.toString()}`
  return await fetchServer<any>(url)
}

// 2. Payments (Thanh toán)
interface PaginatedPaymentResponse {
  success: boolean
  message: string
  data: Payment[]
  pagination: PaymentPaginationMeta
  paidCount: number
  totalRevenue: number
}
export async function getPaymentsServer(params?: PaymentQueryParams): Promise<PaginatedPaymentResponse> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.provider) queryParams.append('provider', params.provider)

  const url = `/payment?${queryParams.toString()}`
  const response = await fetchServer<PaginatedPaymentResponse>(url) as unknown as PaginatedPaymentResponse

  return {
    ...response,
    data: response.data || [],
    pagination: response.pagination || {},
    paidCount: response.paidCount || 0,
    totalRevenue: response.totalRevenue || 0
  }
}

// 3. Plans (Gói dịch vụ)
export async function getPlansServer(params?: PlanQueryParams): Promise<any> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', String(params.page))
  if (params?.limit) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive))
  if (params?.displayType) queryParams.append('displayType', params.displayType)
  if (params?.billingCycle) queryParams.append('billingCycle', params.billingCycle)

  const url = `/plan?${queryParams.toString()}`
  return await fetchServer<any>(url)
}
