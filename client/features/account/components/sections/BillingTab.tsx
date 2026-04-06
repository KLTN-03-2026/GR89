'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Crown } from 'lucide-react'

export default function BillingTab() {
  return (
    <div className="space-y-8">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Gói thành viên</CardTitle>
          <CardDescription>Thông tin về gói thành viên hiện tại của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Gói premium</h4>
                  <p className="text-gray-600">199,000đ/tháng</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 px-3 py-1">Đang hoạt động</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Phương thức thanh toán</CardTitle>
          <CardDescription>Quản lý thông tin thanh toán của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gray-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Ví điện tử</h4>
                  <p className="text-sm text-gray-600">•••• •••• •••• 1234</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-white/50">Chỉnh sửa</Button>
            </div>
            <Button variant="outline" className="w-full bg-white/50">Thêm phương thức thanh toán</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


