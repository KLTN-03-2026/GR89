'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Receipt, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import { getMyPayments, UserPayment } from '../../services/accountApi'
import { toast } from 'react-toastify'
import { useAuth } from '@/libs/contexts/AuthContext'

interface OrderItem {
  id: string
  amount: string
  status: 'success' | 'pending' | 'failed'
  time: string
}

export default function OrdersTab() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(5)

  useEffect(() => {
    if (!user?._id) {
      setOrders([])
      setIsLoading(false)
      return
    }

    const fetchOrders = async () => {
      setIsLoading(true)
      await getMyPayments()
        .then((res) => {
          const mapped = (res.data || []).map((payment: UserPayment) => {
            const mappedStatus: OrderItem['status'] =
              payment.status === 'paid' ? 'success'
                : payment.status === 'pending' ? 'pending'
                  : 'failed'

            const dateToShow = payment.paymentDate || payment.createdAt
            const displayTime = dateToShow
              ? new Date(dateToShow).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
              : 'Không rõ thời gian'

            return {
              id: String(payment._id).slice(-8).toUpperCase(),
              amount: `${Number(payment.amount || 0).toLocaleString('vi-VN')} VND`,
              status: mappedStatus,
              time: displayTime
            }
          })
          setOrders(mapped)
        })
        .catch((error) => {
          if (![401, 410].includes(error?.response?.status)) {
            toast.error(error?.response?.data?.message || 'Không thể tải lịch sử đơn hàng')
          }
        })
        .finally(() => setIsLoading(false))
    }
    fetchOrders()
  }, [user?._id])

  useEffect(() => {
    setVisibleCount(5)
  }, [orders.length])

  const statusBadge = (s: OrderItem['status']) => {
    if (s === 'success') return <Badge className="bg-green-100 text-green-800">Thành công</Badge>
    if (s === 'pending') return <Badge className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>
    return <Badge className="bg-red-100 text-red-800">Thất bại</Badge>
  }

  const hasOrders = orders.length > 0
  const headerCount = useMemo(() => orders.length, [orders.length])
  const visibleOrders = useMemo(() => orders.slice(0, visibleCount), [orders, visibleCount])
  const hasMoreOrders = visibleCount < orders.length

  return (
    <div className="space-y-8">
      <Card className="rounded-xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Lịch sử đơn hàng</CardTitle>
              <CardDescription>Dễ dàng theo dõi các giao dịch mua của bạn</CardDescription>
            </div>
            {hasOrders && (
              <Badge className="bg-gray-100 text-gray-800 hidden sm:inline">{headerCount} đơn</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-600">Đang tải lịch sử đơn hàng...</div>
          ) : !hasOrders ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Chưa có đơn hàng</h4>
              <p className="text-sm text-gray-600 mb-4">Bạn chưa phát sinh giao dịch nào. Hãy khám phá khóa học để bắt đầu.</p>
              <Button variant="outline" className="inline-flex items-center gap-2">Khám phá ngay <ArrowRight className="w-4 h-4" /></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleOrders.map((o) => (
                <div key={o.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-sm transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Receipt className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900">{o.amount}</div>
                        <div className="text-xs text-gray-500">Mã đơn: {o.id}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{o.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {statusBadge(o.status)}
                    </div>
                  </div>
                </div>
              ))}

              {hasMoreOrders && (
                <div className="pt-3 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className="inline-flex items-center gap-2"
                  >
                    Xem thêm
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


