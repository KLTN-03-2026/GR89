// lib/fetch-server.ts
import 'server-only' // Đảm bảo không bao giờ import nhầm vào Client
import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
  next: number | null
  prev: number | null
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: Pagination
}

export async function fetchServer<T = unknown>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const cookieStore = await cookies()
  const cookieString = cookieStore
    .getAll()
    .map((c) => `${encodeURIComponent(c.name)}=${encodeURIComponent(c.value)}`)
    .join('; ')

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (cookieString) headers.set('Cookie', cookieString)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: options.cache || 'no-store',
  })

  const raw = await response.text()
  const payload = raw ? (() => { try { return JSON.parse(raw) } catch { return { message: raw } } })() : {}

  if (!payload.success) {
    const message = payload?.message || payload?.error || `API Error: ${response.statusText}`
    const error = new Error(message) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return payload as ApiResponse<T>
}
