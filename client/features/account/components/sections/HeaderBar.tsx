'use client'
import { Button } from '@/components/ui/button'
import { User, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HeaderBar() {
  const router = useRouter()
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Tài khoản</h1>
                <p className="text-sm text-gray-600">Quản lý thông tin cá nhân và cài đặt</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


