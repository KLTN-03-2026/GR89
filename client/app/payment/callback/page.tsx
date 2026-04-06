'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, ArrowRight, Home, RefreshCw } from 'lucide-react'
import { handleVNPayCallback, type PaymentCallbackResponse } from '@/features/upgrade/services/paymentApi'
import { toast } from 'react-toastify'
import { useAuth } from '@/libs/contexts/AuthContext'

type PaymentStatus = 'processing' | 'success' | 'failed' | 'cancelled'

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<PaymentStatus>('processing')
  const [paymentData, setPaymentData] = useState<PaymentCallbackResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { refreshProfile } = useAuth()

  useEffect(() => {
    const processCallback = async () => {
      const params: Record<string, string> = {}
      searchParams.forEach((value, key) => {
        params[key] = value
      })

      // Kiểm tra có params không
      if (!params.vnp_ResponseCode && !params.vnp_TxnRef) {
        setStatus('failed')
        setIsLoading(false)
        toast.error('Thiếu thông tin giao dịch')
        return
      }

      // Gửi callback đến backend để xử lý
      await handleVNPayCallback(params)
        .then(res => {
          if (params.vnp_ResponseCode === '00' && params.vnp_TransactionStatus === '00') {
            setStatus('success')
            setPaymentData(res.data || null)
            toast.success(res.message || 'Thanh toán thành công!')
          } else {
            // Các mã khác = thất bại
            setStatus('failed')
            setPaymentData(res.data || null)
            toast.error(res.message || 'Thanh toán thất bại')
          }
        })
        .catch(err => {
          setStatus('failed')
          setPaymentData(null)
          toast.error(err.message || 'Thanh toán thất bại')
        })
        .finally(() => {
          setIsLoading(false)
          refreshProfile()
        })
    }

    processCallback()
  }, [searchParams])

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-20 h-20 text-green-500" />,
          title: 'Thanh toán thành công!',
          description: 'Giao dịch của bạn đã được xử lý thành công. Gói của bạn đã được kích hoạt.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700'
        }
      case 'failed':
      case 'cancelled':
        return {
          icon: <XCircle className="w-20 h-20 text-red-500" />,
          title: 'Thanh toán thất bại',
          description: 'Giao dịch không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700'
        }
      default:
        return {
          icon: <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />,
          title: 'Đang xử lý...',
          description: 'Vui lòng đợi trong giây lát, chúng tôi đang xử lý giao dịch của bạn.',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700'
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-2xl shadow-2xl ${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            {statusConfig.icon}
          </div>
          <CardTitle className={`text-3xl font-bold ${statusConfig.textColor}`}>
            {statusConfig.title}
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {statusConfig.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          {paymentData && (
            <div className="bg-white rounded-lg p-6 border border-gray-200 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Chi tiết giao dịch</h3>
              {paymentData.paymentId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-mono text-sm font-semibold">{paymentData.paymentId}</span>
                </div>
              )}
              {paymentData.amount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-gray-900">
                    {paymentData.amount.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              )}
              {paymentData.planId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gói:</span>
                  <span className="font-semibold text-gray-900">{paymentData.planId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái:</span>
                <span className={`font-semibold ${paymentData.status === 'paid' ? 'text-green-600' :
                  paymentData.status === 'failed' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                  {paymentData.status === 'paid' ? 'Đã thanh toán' :
                    paymentData.status === 'failed' ? 'Thất bại' :
                      'Đang xử lý'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isLoading && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {status === 'success' ? (
                <>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Về trang chủ
                  </Button>
                  <Button
                    onClick={() => router.push('/account')}
                    variant="outline"
                    className="flex-1 border-2 py-6 text-lg font-semibold"
                  >
                    Xem gói của tôi
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => router.refresh()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Thử thanh toán lại
                  </Button>
                  <Button
                    onClick={() => router.push('/dashboard')}
                    variant="outline"
                    className="flex-1 border-2 py-6 text-lg font-semibold"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Về trang chủ
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Có câu hỏi? Liên hệ{' '}
              <a href="mailto:support@englishmastery.com" className="text-blue-600 hover:underline font-medium">
                hỗ trợ khách hàng
              </a>
              {' '}hoặc gọi{' '}
              <a href="tel:1900555577" className="text-blue-600 hover:underline font-medium">
                1900 555 577
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




