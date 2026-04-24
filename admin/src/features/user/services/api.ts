import { UserScore, UserScoreStats, TopUser, SkillAnalysis, User, UserStudyHistoryEntry } from '@/features/user/types'
import AuthorizedAxios from '@/lib/apis/authorizrAxios'

/** Shape response API (khớp lib/apis/api) */
interface ApiResponse<T> {
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

/*=============== USER SCORES ==============*/
export async function getAllUserScores(): Promise<ApiResponse<UserScore[]>> {
  const response = await AuthorizedAxios.get('/user-scores/legacy')
  return response.data as ApiResponse<UserScore[]>
}

export interface UserScorePaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  pagingCounter?: number
  hasPrev?: boolean
  hasNext?: boolean
  prev?: number | null
  next?: number | null
}

export interface PaginatedUserScoreResponse {
  success: boolean
  message: string
  data: UserScore[]
  total: number
  limit: number
  pages: number
  page: number
  pagingCounter: number
  hasPrev: boolean
  hasNext: boolean
  prev: number | null
  next: number | null
}

export interface UserScoreQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'totalPoints' | 'fullName' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
}

export async function getAllUserScoresPaginated(
  params?: UserScoreQueryParams
): Promise<{ success: boolean; data: UserScore[]; pagination: UserScorePaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')

  const url = `/user-scores/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as ApiResponse<UserScore[]>

  const pagination: UserScorePaginationMeta = {
    page: payload.pagination?.page ?? params?.page ?? 1,
    limit: payload.pagination?.limit ?? params?.limit ?? 10,
    total: payload.pagination?.total ?? 0,
    pages: payload.pagination?.pages ?? 0,
    hasPrev: payload.pagination?.hasPrev ?? false,
    hasNext: payload.pagination?.hasNext ?? false,
    prev: payload.pagination?.prev ?? null,
    next: payload.pagination?.next ?? null,
  }

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination,
  }
}

export async function getUserScoreById(userId: string): Promise<ApiResponse<UserScore>> {
  const response = await AuthorizedAxios.get(`/user-scores/${userId}`)
  return response.data as ApiResponse<UserScore>
}

export async function getUserStudyHistory(
  userId: string,
  limit: number = 80
): Promise<ApiResponse<UserStudyHistoryEntry[]>> {
  const response = await AuthorizedAxios.get(`/user/${userId}/study-history`, {
    params: { limit },
  })
  return response.data as ApiResponse<UserStudyHistoryEntry[]>
}

export async function getUserScoresStats(): Promise<ApiResponse<UserScoreStats>> {
  const response = await AuthorizedAxios.get('/user-scores/stats')
  return response.data as ApiResponse<UserScoreStats>
}

export async function getTopUsers(limit: number = 5): Promise<ApiResponse<TopUser[]>> {
  const response = await AuthorizedAxios.get(`/user-scores/top?limit=${limit}`)
  return response.data as ApiResponse<TopUser[]>
}

export async function getSkillAnalysis(): Promise<ApiResponse<SkillAnalysis[]>> {
  const response = await AuthorizedAxios.get('/user-scores/skills')
  return response.data as ApiResponse<SkillAnalysis[]>
}

export interface DataUserScore {
  totalPoints: number
  vocabularyPoints: number
  grammarPoints: number
  readingPoints: number
  listeningPoints: number
  speakingPoints: number
  writingPoints: number
  currentStreak: number
  longestStreak: number
  totalStudyTime: number
  lastActiveDate: string
  isActive: boolean
}

export async function createOrUpdateUserScore(
  userId: string,
  data: DataUserScore
): Promise<ApiResponse<UserScore>> {
  const response = await AuthorizedAxios.put(`/user-scores/${userId}`, data)
  return response.data as ApiResponse<UserScore>
}

export async function deleteUserScore(userId: string): Promise<ApiResponse<UserScore>> {
  const response = await AuthorizedAxios.delete(`/user-scores/${userId}`)
  return response.data as ApiResponse<UserScore>
}

/*=============== USER MANAGEMENT ==============*/
export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  const response = await AuthorizedAxios.get('/user/legacy')
  return response.data as ApiResponse<User[]>
}

export interface UserPaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  pagingCounter?: number
  hasPrev?: boolean
  hasNext?: boolean
  prev?: number | null
  next?: number | null
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'fullName' | 'email' | 'role' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  isActive?: boolean
  role?: string
}

export async function getAllUsersPaginated(
  params?: UserQueryParams
): Promise<{ success: boolean; data: User[]; pagination: UserPaginationMeta }> {
  const queryParams = new URLSearchParams()
  if (params?.page != null) queryParams.append('page', String(params.page))
  if (params?.limit != null) queryParams.append('limit', String(params.limit))
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
  if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive ? 'true' : 'false')
  if (params?.role) queryParams.append('role', params.role)

  const url = `/user/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
  const res = await AuthorizedAxios.get(url)
  const payload = res.data as ApiResponse<User[]>

  const pagination: UserPaginationMeta = {
    page: payload.pagination?.page ?? params?.page ?? 1,
    limit: payload.pagination?.limit ?? params?.limit ?? 10,
    total: payload.pagination?.total ?? 0,
    pages: payload.pagination?.pages ?? 0,
    hasPrev: payload.pagination?.hasPrev ?? false,
    hasNext: payload.pagination?.hasNext ?? false,
    prev: payload.pagination?.prev ?? null,
    next: payload.pagination?.next ?? null,
  }

  return {
    success: payload.success || false,
    data: payload.data || [],
    pagination,
  }
}

export interface DataCreateUser {
  fullName: string
  email: string
  password: string
  role: string
}

export async function createUser(data: DataCreateUser): Promise<ApiResponse<User>> {
  const response = await AuthorizedAxios.post('/auth/create-user', data)
  return response.data as ApiResponse<User>
}

export async function updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
  const response = await AuthorizedAxios.put(`/user/${id}/status`, { isActive })
  return response.data as ApiResponse<User>
}

export async function deleteUser(id: string): Promise<ApiResponse<User>> {
  const response = await AuthorizedAxios.delete(`/user/${id}`)
  return response.data as ApiResponse<User>
}

export interface DataUpdateUser {
  fullName: string
  email: string
  role: string
  isActive: boolean
}

export async function updateUser(id: string, data: DataUpdateUser): Promise<ApiResponse<User>> {
  const response = await AuthorizedAxios.put(`/user/${id}`, data)
  return response.data as ApiResponse<User>
}
