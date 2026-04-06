'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Receipt, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderItem {
  id: string
  amount: string
  status: 'success' | 'pending' | 'failed'
  time: string
}

const mockOrders: OrderItem[] = [
  { id: '1R6YCZQG', amount: '3.000.000 VND', status: 'success', time: '08:28 30/11/2023' },
  { id: '9KHG2PLM', amount: '799.000 VND', status: 'pending', time: '14:03 12/07/2024' },
  { id: '7QWXT123', amount: '1.299.000 VND', status: 'failed', time: '19:41 03/06/2024' },
]

export default function OrdersTab() {
  const statusBadge = (s: OrderItem['status']) => {
    if (s === 'success') return <Badge className="bg-green-100 text-green-800">Thành công</Badge>
    if (s === 'pending') return <Badge className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>
    return <Badge className="bg-red-100 text-red-800">Thất bại</Badge>
  }

  const hasOrders = mockOrders.length > 0

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
              <Badge className="bg-gray-100 text-gray-800 hidden sm:inline">{mockOrders.length} đơn</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasOrders ? (
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
              {mockOrders.map((o) => (
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
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Xem chi tiết</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


