'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Home,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/libs/contexts/AuthContext'
import { useEffect } from 'react'

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshProfile } = useAuth()

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const code = searchParams.get('code')
  const status = searchParams.get('status')
  const cancel = searchParams.get('cancel')

  const isSuccess = code === '00' ? code === '00' && status === 'PAID' : true
  const isCancel = cancel === 'true' || status === 'CANCELLED'

  const ui = isSuccess
    ? {
      icon: <CheckCircle2 className="w-14 h-14 text-green-500" />,
      title: 'Thanh toán thành công',
      desc: 'Gói của bạn đã được kích hoạt 🎉',
      color: 'text-green-600'
    }
    : isCancel
      ? {
        icon: <XCircle className="w-14 h-14 text-orange-500" />,
        title: 'Bạn đã hủy thanh toán',
        desc: 'Không có giao dịch nào được xử lý',
        color: 'text-orange-600'
      }
      : {
        icon: <Loader2 className="w-14 h-14 text-blue-500 animate-spin" />,
        title: 'Đang xử lý...',
        desc: 'Vui lòng đợi trong giây lát',
        color: 'text-blue-600'
      }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-6">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-50 rounded-full">
            {ui.icon}
          </div>
        </div>

        {/* TITLE */}
        <h1 className={`text-2xl font-bold ${ui.color}`}>
          {ui.title}
        </h1>

        {/* DESC */}
        <p className="text-gray-500 mt-2">
          {ui.desc}
        </p>

        {/* ORDER INFO (optional) */}
        {searchParams.get('orderCode') && (
          <div className="mt-5 bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
            Mã đơn: <b>{searchParams.get('orderCode')}</b>
          </div>
        )}

        {/* BUTTONS */}
        <div className="mt-8 flex flex-col gap-3">
          {isSuccess ? (
            <>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition"
              >
                <Home className="inline w-4 h-4 mr-2" />
                Về trang chủ
              </button>

              <button
                onClick={() => router.push('/account')}
                className="w-full py-3 rounded-xl border font-semibold hover:bg-gray-50 transition"
              >
                Xem gói của tôi
                <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
              >
                <RefreshCw className="inline w-4 h-4 mr-2" />
                Thử lại
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 rounded-xl border font-semibold hover:bg-gray-50 transition"
              >
                <Home className="inline w-4 h-4 mr-2" />
                Về trang chủ
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  )
}