'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, Home, ArrowLeft } from 'lucide-react'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderCode = searchParams.get('orderCode')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">

      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center border border-red-100">

        {/* ICON */}
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-red-600 mt-6">
          Thanh toán đã bị hủy
        </h1>

        <p className="text-gray-500 mt-2">
          Giao dịch của bạn chưa được hoàn tất
        </p>

        {/* ORDER INFO */}
        {orderCode && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            Mã giao dịch: <span className="font-semibold">{orderCode}</span>
          </div>
        )}

        {/* NOTE */}
        <div className="mt-6 text-sm text-gray-500 leading-relaxed">
          Bạn có thể thử lại thanh toán hoặc chọn phương thức khác.
          Nếu gặp lỗi, hãy liên hệ hỗ trợ.
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex flex-col gap-3">
          {/* BACK HOME */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-100 py-3 rounded-xl font-medium transition"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>

          {/* BACK */}
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 text-sm mt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

        </div>

      </div>
    </div>
  )
}