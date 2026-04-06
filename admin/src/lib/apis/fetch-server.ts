// lib/fetch-server.ts
import 'server-only' // Đảm bảo không bao giờ import nhầm vào Client
import { cookies } from 'next/headers'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

export async function fetchServer<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const cookieStore = await cookies()

  const cookieString = cookieStore.toString()

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieString,
      ...options.headers,
    },
    cache: options.cache || 'no-store' // Mặc định không cache để data luôn mới
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || data.error || `API Error: ${response.statusText}`) as { status?: number }
    error.status = response.status
    throw error
  }

  return data.data as T
}