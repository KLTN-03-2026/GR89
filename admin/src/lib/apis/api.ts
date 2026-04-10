import { Quiz } from "@/types"
import AuthorizedAxios from "./authorizrAxios"

interface Response<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
    hasNext?: boolean
    hasPrev?: boolean
    next?: number | null
    prev?: number | null
  }
}

/*=============== ADMIN DASHBOARD ==============*/
export interface AdminOverview {
  kpis: {
    totalUsers: number
    totalRevenue: number
    totalLessons: number
    totalCompletedLessons: number
    uploadedVideos: number
    uploadedImages: number
    growth: { users: number; revenue: number }
  }
  contentStats: {
    reading: number
    ipa: number
    grammar: number
    listening: number
    speaking: number
    writing: number
    vocabulary: number
    entertainment: number
  }
  newUsers: { fullName: string; email: string; role: string; isActive: boolean; createdAt: string }[]
  recentActivities: { type: string; title: string; description?: string; createdAt: string }[]
  recentMedia: { url: string; type: string; size: number; format: string; createdAt: string }[]
  totalQuizAttempts: number
}

export async function getAdminDashboardOverview(): Promise<Response<AdminOverview>> {
  const response = await AuthorizedAxios.get('/admin/dashboard/overview')
  return response.data as Response<AdminOverview>
}

export interface AdminActivityItem {
  _id: string
  adminId?: { _id: string; fullName: string; email: string; role: string }
  adminRole: 'admin' | 'content'
  action: string
  resourceType: string
  resourceId?: string
  description: string
  metadata?: Record<string, unknown>
  ip?: string
  userAgent?: string
  createdAt: string
}

export interface AdminActivitiesResponse {
  data: AdminActivityItem[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export async function getAdminActivities(params?: {
  page?: number
  limit?: number
  action?: string
  resourceType?: string
  adminId?: string
  search?: string
}): Promise<Response<AdminActivityItem[]>> {
  const query = new URLSearchParams()
  if (params?.page) query.append('page', String(params.page))
  if (params?.limit) query.append('limit', String(params.limit))
  if (params?.action) query.append('action', params.action)
  if (params?.resourceType) query.append('resourceType', params.resourceType)
  if (params?.adminId) query.append('adminId', params.adminId)
  if (params?.search) query.append('search', params.search)
  const response = await AuthorizedAxios.get(`/admin/activities${query.toString() ? `?${query.toString()}` : ''}`)
  return response.data as Response<AdminActivityItem[]>
}

export interface DashboardReportResponse {
  filters: {
    startDate: string
    endDate: string
    category: "all" | "grammar" | "vocabulary" | "reading" | "listening" | "speaking" | "ipa" | "writing"
  }
  kpis: {
    revenue: number
    revenueGrowth: number
    activeUsers: number
    activeUsersGrowth: number
    completedLessons: number
    studyHours: number
  }
  topLessons: Array<{
    lessonId: string
    title: string
    category: string
    attempts: number
    completionRate: number
    avgProgress: number
  }>
  revenueByProvider: Array<{
    provider: string
    users: number
    revenue: number
    share: number
  }>
  revenueByPlan: Array<{
    planId: string
    planName: string
    revenue: number
    paidCount: number
    totalDiscount: number
  }>
  categoryStats: Array<{
    category: string
    attempts: number
    completed: number
    completionRate: number
    avgProgress: number
    studyHours: number
  }>
}

export interface ReportQueryParams {
  startDate?: string
  endDate?: string
  category?: "all" | "grammar" | "vocabulary" | "reading" | "listening" | "speaking" | "ipa" | "writing"
}

export async function getDashboardReport(params?: ReportQueryParams): Promise<Response<DashboardReportResponse>> {
  const query = new URLSearchParams()
  if (params?.startDate) query.append('startDate', params.startDate)
  if (params?.endDate) query.append('endDate', params.endDate)
  if (params?.category) query.append('category', params.category)
  const response = await AuthorizedAxios.get(`/report/dashboard${query.toString() ? `?${query.toString()}` : ''}`)
  return response.data as Response<DashboardReportResponse>
}


/*=============== QUIZ ==============*/
//get quiz list
export async function getQuizList(): Promise<Response<Quiz[]>> {
  const response = await AuthorizedAxios.get('/quiz/')
  return response.data as Response<Quiz[]>
}

//create quiz
interface DataCreateQuiz {
  assignment: string;
  question: string;
  type: "Multiple Choice" | "Fill in the blank";
  options?: string[];
  answer: string;
  explanation: string;
}
export async function createQuiz(data: DataCreateQuiz) {
  const response = await AuthorizedAxios.post('/quiz/create', data)
  return response.data as Response<Quiz>
}

// export grammar excel
export async function exportGrammarExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/grammar/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

// IPA: export/import
export async function exportIpaExcel(): Promise<Blob> {
  const res = await AuthorizedAxios.get('/ipa/export', { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/*=============== ENTERTAINMENT ==============*/
export interface Entertainment {
  _id: string
  title: string
  description?: string
  videoUrl?: { _id: string; url: string; format?: string; size?: number; duration?: number } | string
  thumbnailUrl?: { _id: string; url: string } | string
  type?: string
  status?: boolean
  isVipRequired?: boolean
  author?: string
  createdBy: { _id: string; fullName: string; email: string }
  createdAt: string
  updatedAt: string
}

export interface EntertainmentPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasPrev?: boolean
  hasNext?: boolean
  prev?: number | null
  next?: number | null
}

export async function getEntertainmentList(): Promise<Response<Entertainment[]>> {
  const res = await AuthorizedAxios.get('/entertainment/legacy')
  return res.data as Response<Entertainment[]>
}

export async function getEntertainmentPaginated(params?: {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: boolean
  createdBy?: string
  type?: 'movie' | 'music' | 'podcast'
}): Promise<{ success: boolean; data: Entertainment[]; pagination: EntertainmentPaginationMeta }> {
  const query = new URLSearchParams()
  if (params?.page != null) query.append('page', String(params.page))
  if (params?.limit != null) query.append('limit', String(params.limit))
  if (params?.search) query.append('search', params.search)
  if (params?.sortBy) query.append('sortBy', params.sortBy)
  if (params?.sortOrder) query.append('sortOrder', params.sortOrder)
  if (params?.status !== undefined) query.append('status', params.status ? 'true' : 'false')
  if (params?.createdBy) query.append('createdBy', params.createdBy)
  if (params?.type) query.append('type', params.type)

  const url = `/entertainment/${query.toString() ? `?${query.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data
  const pagination: EntertainmentPaginationMeta = {
    page: payload.pagination?.page ?? params?.page ?? 1,
    limit: payload.pagination?.limit ?? params?.limit ?? 10,
    total: payload.pagination?.total || 0,
    pages: payload.pagination?.pages ?? 0,
    hasPrev: payload.pagination?.hasPrev ?? false,
    hasNext: payload.pagination?.hasNext ?? false,
    prev: payload.pagination?.prev ?? null,
    next: payload.pagination?.next ?? null,
  }
  return { success: payload.success || false, data: payload.data || [], pagination }
}

export async function getEntertainmentById(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.get(`/entertainment/${id}`)
  return res.data as Response<Entertainment>
}

export async function createEntertainment(data: Partial<Entertainment>): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.post('/entertainment/', data)
  return res.data as Response<Entertainment>
}

export async function updateEntertainment(id: string, data: Partial<Entertainment>): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.put(`/entertainment/${id}`, data)
  return res.data as Response<Entertainment>
}

export async function deleteEntertainment(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.delete(`/entertainment/${id}`)
  return res.data as Response<Entertainment>
}

export async function deleteManyEntertainment(ids: string[]): Promise<Response<Entertainment[]>> {
  const res = await AuthorizedAxios.delete(`/entertainment/`, { data: { ids } })
  return res.data as Response<Entertainment[]>
}

export async function toggleEntertainmentStatus(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.patch(`/entertainment/${id}/status`)
  return res.data as Response<Entertainment>
}

// Toggle Entertainment VIP status
export async function toggleEntertainmentVipStatus(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.patch(`/entertainment/${id}/vip`)
  return res.data as Response<Entertainment>
}

// update entertainment status
export async function updateEntertainmentStatus(id: string): Promise<Response<Entertainment>> {
  const res = await AuthorizedAxios.put(`/entertainment/${id}/status`)
  return res.data as Response<Entertainment>
}

// update status for many entertainment items
export async function updateMultipleEntertainmentStatus(ids: string[], status: boolean): Promise<Response<{ updatedCount: number; updatedEntertainments: Entertainment[] }>> {
  const res = await AuthorizedAxios.put('/entertainment/bulk/status', {
    ids,
    status
  })
  return res.data as Response<{ updatedCount: number; updatedEntertainments: Entertainment[] }>
}

export async function exportEntertainmentExcel(type?: 'movie' | 'music' | 'podcast'): Promise<Blob> {
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  const res = await AuthorizedAxios.get(`/entertainment/export${params.toString() ? `?${params.toString()}` : ''}`, { responseType: 'arraybuffer' })
  return new Blob([res?.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export async function importEntertainmentData(file: File, skipErrors: boolean = false, type?: 'movie' | 'music' | 'podcast'): Promise<Response<Entertainment[]>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skipErrors', String(skipErrors))
  if (type) formData.append('type', type)
  const res = await AuthorizedAxios.post('/entertainment/import', formData)
  return res.data as Response<Entertainment[]>
}


/*=============== SPEAKING PRACTICE (USER) ==============*/
export interface SpeakingPracticeResult {
  success: boolean
  message?: string
  data?: {
    score: number
    message: string
    feedback?: string[]
  }
}

export async function submitSpeakingPracticeAudio(params: {
  speakingId: string
  sentenceIndex: number
  audioFile: File
}): Promise<SpeakingPracticeResult> {
  const form = new FormData()
  form.append('audio', params.audioFile)
  const res = await AuthorizedAxios.post(`/speaking/user/${params.speakingId}/${params.sentenceIndex}/practice`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data as SpeakingPracticeResult
}

/*=============== PLAN MANAGEMENT ==============*/
export interface Plan {
  _id: string
  name: string
  description?: string
  price: number
  currency: string
  billingCycle: "monthly" | "yearly" | "lifetime"
  features: string[]
  isActive: boolean
  sortOrder: number
  displayType: "default" | "vip" | "premium"
  originalPrice?: number
  discountPercent?: number
  validFrom?: string | Date
  validTo?: string | Date
  createdBy?: { _id: string; fullName: string; email: string } | string
  updatedBy?: { _id: string; fullName: string; email: string } | string
  createdAt: string
  updatedAt: string
}

export interface PlanPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasPrev: boolean
  hasNext: boolean
  prev: number | null
  next: number | null
}

export interface PlanQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  displayType?: "default" | "vip" | "premium"
  billingCycle?: "monthly" | "yearly" | "lifetime"
  createdBy?: string
}

export interface PaginatedPlanResponse {
  success: boolean
  message: string
  data: Plan[]
  pagination: PlanPaginationMeta
}

export async function getPlansPaginated(params?: PlanQueryParams): Promise<{ success: boolean; data: Plan[]; pagination: PlanPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.displayType) queryParams.append('displayType', params.displayType)
  if (params?.billingCycle) queryParams.append('billingCycle', params.billingCycle)
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/plan${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedPlanResponse

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination: payload.pagination,
  }
}

export async function getPlanById(id: string): Promise<Response<Plan>> {
  const response = await AuthorizedAxios.get(`/plan/${id}`)
  return response.data as Response<Plan>
}

interface DataPlan {
  name: string
  description?: string
  price: number
  currency: string
  billingCycle: "monthly" | "yearly" | "lifetime"
  features: string[]
  isActive?: boolean
  sortOrder?: number
  displayType?: "default" | "vip" | "premium"
  originalPrice?: number
  discountPercent?: number
  validFrom?: string
  validTo?: string
}

export async function createPlan(data: DataPlan): Promise<Response<Plan>> {
  const response = await AuthorizedAxios.post('/plan', data)
  return response.data as Response<Plan>
}

export async function updatePlan(id: string, data: Partial<DataPlan>): Promise<Response<Plan>> {
  const response = await AuthorizedAxios.put(`/plan/${id}`, data)
  return response.data as Response<Plan>
}

export async function deletePlan(id: string): Promise<Response<Plan>> {
  const response = await AuthorizedAxios.delete(`/plan/${id}`)
  return response.data as Response<Plan>
}

export async function deleteManyPlans(ids: string[]): Promise<Response<{ deletedCount: number; deletedPlans: Plan[] }>> {
  const response = await AuthorizedAxios.post('/plan/delete-many', { ids })
  return response.data as Response<{ deletedCount: number; deletedPlans: Plan[] }>
}

export async function updatePlanStatus(id: string): Promise<Response<Plan>> {
  const response = await AuthorizedAxios.put(`/plan/${id}/status`)
  return response.data as Response<Plan>
}

export async function updateManyPlansStatus(ids: string[], isActive: boolean): Promise<Response<{ updatedCount: number; updatedPlans: Plan[] }>> {
  const response = await AuthorizedAxios.put('/plan/bulk/status', { ids, isActive })
  return response.data as Response<{ updatedCount: number; updatedPlans: Plan[] }>
}

export async function importPlanExcel(file: File, skipErrors: boolean = false): Promise<Response<{ created: number; updated: number; errors: Array<{ row: number; reason: string }>; total: number }>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skipErrors', String(skipErrors))
  const response = await AuthorizedAxios.post('/plan/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data as Response<{ created: number; updated: number; errors: Array<{ row: number; reason: string }>; total: number }>
}

export async function exportPlanExcel(): Promise<Blob> {
  const response = await AuthorizedAxios.get('/plan/export', { responseType: 'arraybuffer' })
  return new Blob([response.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/*=============== PAYMENT MANAGEMENT ==============*/
export interface Payment {
  _id: string
  userId: { _id: string; fullName: string; email: string } | string
  planId: string
  amount: number
  provider: "vnpay" | "momo" | "stripe" | "paypal"
  transactionId?: string
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled"
  paymentDate?: string
  couponId?: { _id: string; code: string; name: string } | string
  discountAmount?: number
  createdAt: string
  updatedAt: string
}

export interface PaymentPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasPrev: boolean
  hasNext: boolean
  prev: number | null
  next: number | null
}

export interface PaymentQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: "pending" | "paid" | "failed" | "refunded" | "cancelled"
  provider?: "vnpay" | "momo" | "stripe" | "paypal"
  userId?: string
  planId?: string
  startDate?: string
  endDate?: string
}

export interface PaginatedPaymentResponse {
  success: boolean
  message: string
  data: Payment[]
  pagination: PaymentPaginationMeta
}

export async function getPaymentsPaginated(params?: PaymentQueryParams): Promise<{ success: boolean; data: Payment[]; pagination: PaymentPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.status) queryParams.append('status', params.status)
  if (params?.provider) queryParams.append('provider', params.provider)
  if (params?.userId) queryParams.append('userId', params.userId)
  if (params?.planId) queryParams.append('planId', params.planId)
  if (params?.startDate) queryParams.append('startDate', params.startDate)
  if (params?.endDate) queryParams.append('endDate', params.endDate)

  const url = `/payment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedPaymentResponse

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination: payload.pagination,
  }
}

export async function getPaymentById(id: string): Promise<Response<Payment>> {
  const response = await AuthorizedAxios.get(`/payment/${id}`)
  return response.data as Response<Payment>
}

interface DataPayment {
  userId: string
  planId: string
  amount: number
  provider: "vnpay" | "momo" | "stripe" | "paypal"
  transactionRef: string
  status?: "pending" | "paid" | "failed" | "refunded" | "cancelled"
  paymentDate?: string
  couponId?: string
  discountAmount?: number
}

export async function createPayment(data: DataPayment): Promise<Response<Payment>> {
  const response = await AuthorizedAxios.post('/payment', data)
  return response.data as Response<Payment>
}

export async function updatePayment(id: string, data: Partial<DataPayment>): Promise<Response<Payment>> {
  const response = await AuthorizedAxios.put(`/payment/${id}`, data)
  return response.data as Response<Payment>
}

export async function deletePayment(id: string): Promise<Response<Payment>> {
  const response = await AuthorizedAxios.delete(`/payment/${id}`)
  return response.data as Response<Payment>
}

export async function deleteManyPayments(ids: string[]): Promise<Response<{ deletedCount: number; deletedPayments: Payment[] }>> {
  const response = await AuthorizedAxios.post('/payment/delete-many', { ids })
  return response.data as Response<{ deletedCount: number; deletedPayments: Payment[] }>
}

export async function importPaymentExcel(file: File, skipErrors: boolean = false): Promise<Response<{ created: number; updated: number; errors: Array<{ row: number; reason: string }>; total: number }>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skipErrors', String(skipErrors))
  const response = await AuthorizedAxios.post('/payment/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data as Response<{ created: number; updated: number; errors: Array<{ row: number; reason: string }>; total: number }>
}

export async function exportPaymentExcel(): Promise<Blob> {
  const response = await AuthorizedAxios.get('/payment/export', { responseType: 'arraybuffer' })
  return new Blob([response.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

/*=============== COUPON MANAGEMENT ==============*/
export interface Coupon {
  _id: string
  code: string
  name: string
  description?: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  validFrom: string
  validTo: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  applicablePlans?: string[]
  isFirstTimeOnly: boolean
  createdBy?: { _id: string; fullName: string; email: string } | string
  updatedBy?: { _id: string; fullName: string; email: string } | string
  createdAt: string
  updatedAt: string
}

export interface CouponPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasPrev: boolean
  hasNext: boolean
  prev: number | null
  next: number | null
}

export interface CouponQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  createdBy?: string
}

export interface PaginatedCouponResponse {
  success: boolean
  message: string
  data: Coupon[]
  pagination: CouponPaginationMeta
}

export async function getCouponsPaginated(params?: CouponQueryParams): Promise<{ success: boolean; data: Coupon[]; pagination: CouponPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.createdBy) queryParams.append('createdBy', params.createdBy)

  const url = `/coupon${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as PaginatedCouponResponse

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination: payload.pagination,
  }
}

export async function getCouponById(id: string): Promise<Response<Coupon>> {
  const response = await AuthorizedAxios.get(`/coupon/${id}`)
  return response.data as Response<Coupon>
}

interface DataCoupon {
  code: string
  name: string
  description?: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  validFrom: string
  validTo: string
  usageLimit?: number
  isActive?: boolean
  applicablePlans?: string[]
  isFirstTimeOnly?: boolean
}

export async function createCoupon(data: DataCoupon): Promise<Response<Coupon>> {
  const response = await AuthorizedAxios.post('/coupon', data)
  return response.data as Response<Coupon>
}

export async function updateCoupon(id: string, data: Partial<DataCoupon>): Promise<Response<Coupon>> {
  const response = await AuthorizedAxios.put(`/coupon/${id}`, data)
  return response.data as Response<Coupon>
}

export async function deleteCoupon(id: string): Promise<Response<Coupon>> {
  const response = await AuthorizedAxios.delete(`/coupon/${id}`)
  return response.data as Response<Coupon>
}

export async function deleteManyCoupons(ids: string[]): Promise<Response<{ deletedCount: number; deletedCoupons: Coupon[] }>> {
  const response = await AuthorizedAxios.post('/coupon/delete-many', { ids })
  return response.data as Response<{ deletedCount: number; deletedCoupons: Coupon[] }>
}

export async function updateCouponStatus(id: string): Promise<Response<Coupon>> {
  const response = await AuthorizedAxios.put(`/coupon/${id}/status`)
  return response.data as Response<Coupon>
}

export async function updateManyCouponsStatus(ids: string[], isActive: boolean): Promise<Response<{ updatedCount: number; updatedCoupons: Coupon[] }>> {
  const response = await AuthorizedAxios.put('/coupon/bulk/status', { ids, isActive })
  return response.data as Response<{ updatedCount: number; updatedCoupons: Coupon[] }>
}

export async function importCouponExcel(file: File, skipErrors: boolean = false): Promise<Response<{ created: number; updated: number; errors: Array<{ row: number; reason: string }>; total: number }>> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('skipErrors', String(skipErrors))
  const response = await AuthorizedAxios.post('/coupon/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data as Response<{ created: number; updated: number; errors: Array<{ row: number; reason: string }>; total: number }>
}

export async function exportCouponExcel(): Promise<Blob> {
  const response = await AuthorizedAxios.get('/coupon/export', { responseType: 'arraybuffer' })
  return new Blob([response.data as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}