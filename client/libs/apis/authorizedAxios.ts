'use client'
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { toast } from "react-toastify"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

let isRefreshing = false
let pendingRequests: (() => void)[] = []


function translateErrorMessage(message: string): string {
  const translations: Record<string, string> = {
    "Duplicate title entered": "Tiêu đề đã tồn tại",
    "Duplicate name entered": "Tên đã tồn tại",
    "Duplicate": "Dữ liệu đã tồn tại",
    "duplicate key error": "Dữ liệu đã tồn tại",
    "E11000 duplicate key error": "Dữ liệu đã tồn tại",
  }

  // Kiểm tra các pattern
  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  return message
}

/**
 * Trích xuất message lỗi từ response
 */
function extractErrorMessage(error: AxiosError): string {
  // 1. Kiểm tra response data
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>

    // Message trực tiếp
    if (typeof data.message === "string" && data.message.trim()) {
      return translateErrorMessage(data.message)
    }

    // Error trực tiếp
    if (typeof data.error === "string" && data.error.trim()) {
      return translateErrorMessage(data.error)
    }

    // Errors array
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors
        .map((err) => translateErrorMessage(typeof err === "string" ? err : String(err)))
        .join(", ")
    }

    // Errors object (validation errors)
    if (data.errors && typeof data.errors === "object") {
      const errorMessages: string[] = []
      for (const [key, value] of Object.entries(data.errors)) {
        if (Array.isArray(value)) {
          errorMessages.push(`${key}: ${value.map(v => translateErrorMessage(String(v))).join(", ")}`)
        } else if (typeof value === "string") {
          errorMessages.push(`${key}: ${translateErrorMessage(value)}`)
        }
      }
      if (errorMessages.length > 0) {
        return errorMessages.join(" | ")
      }
    }
  }

  // 2. Kiểm tra error message từ axios
  if (error.message) {
    return translateErrorMessage(error.message)
  }

  // 3. Message mặc định dựa trên status code
  const status = error.response?.status
  const statusMessages: Record<number, string> = {
    400: "Yêu cầu không hợp lệ",
    401: "Không có quyền truy cập",
    403: "Bị từ chối truy cập",
    404: "Không tìm thấy tài nguyên",
    409: "Xung đột dữ liệu",
    410: "Phiên đăng nhập đã hết hạn",
    422: "Dữ liệu không hợp lệ",
    429: "Quá nhiều yêu cầu, vui lòng thử lại sau",
    500: "Lỗi máy chủ",
    502: "Lỗi cổng kết nối",
    503: "Dịch vụ tạm thời không khả dụng",
  }

  if (status && statusMessages[status]) {
    return statusMessages[status]
  }

  // 4. Message mặc định
  return "Đã xảy ra lỗi không xác định"
}

// API chính (có interceptor)
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// API phụ (không interceptor, chỉ để refresh)
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

export const AuthorizedAxios = api

// ◆ Interceptor refresh token
api.interceptors.response.use(
  (res) => {
    const data = res.data
    if (data && typeof data === 'object' && 'success' in data && data.success === false) {
      const message = typeof data.message === 'string' && data.message.trim() ? data.message : 'Đã xảy ra lỗi'
      const err = new AxiosError(message, undefined, res.config, res.request, res) as AxiosError & { _handled?: boolean }
      err._handled = true

      const config = res.config as InternalAxiosRequestConfig & {
        _retry?: boolean
        _skipErrorToast?: boolean
      }
      if (!config?._skipErrorToast) {
        toast.error(translateErrorMessage(message))
      }

      return Promise.reject(err)
    }

    return res
  },

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _skipErrorToast?: boolean
    }

    if (!originalRequest) {
      const message = extractErrorMessage(error)
      toast.error(message)
      const handledError = error as AxiosError & { _handled?: boolean }
      handledError._handled = true
      return Promise.reject(handledError)
    }

    const status = error.response?.status

    // ❗ Chỉ refresh khi access token hết hạn
    if (
      error.response?.status === 410 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true

      // Nếu đang refresh → chờ
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push(() => resolve(api(originalRequest)))
        })
      }

      isRefreshing = true

      try {
        await refreshApi.post('/auth/refresh-token', { role: 'user' })

        // Thông báo các request đang chờ
        pendingRequests.forEach((cb) => cb())
        pendingRequests = []
        isRefreshing = false

        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        pendingRequests = []

        // Refresh hết hạn → logout
        await api.post('/auth/logout')
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
        window.location.href = "/login"

        const handledError = refreshError as AxiosError & { _handled?: boolean }
        handledError._handled = true
        return Promise.reject(handledError)
      }
    }

    // ====================================
    // ❗ XỬ LÝ LỖI VÀ HIỂN THỊ TOAST
    // ====================================

    // Bỏ qua toast nếu request đã đánh dấu skip
    if (originalRequest._skipErrorToast) {
      const handledError = error as AxiosError & { _handled?: boolean }
      handledError._handled = true
      return Promise.reject(handledError)
    }

    // Không hiển thị toast cho các status đã xử lý riêng
    const skipToastStatuses = [401, 410]
    if (status && skipToastStatuses.includes(status)) {
      const handledError = error as AxiosError & { _handled?: boolean }
      handledError._handled = true
      return Promise.reject(handledError)
    }

    // Trích xuất và hiển thị message lỗi
    const message = extractErrorMessage(error)
    toast.error(message)

    // Đánh dấu error đã được xử lý để không log ra console
    const handledError = error as AxiosError & { _handled?: boolean }
    handledError._handled = true

    return Promise.reject(handledError)
  }
)

// =========================
//  GLOBAL ERROR HANDLER
// =========================
// Ngăn chặn unhandled promise rejection từ axios errors đã được xử lý
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason

    // Suppress tất cả AxiosError đã được xử lý
    if (error?.isAxiosError && (error?._handled || error?.config)) {
      event.preventDefault()
    }
  })
}

export default api
