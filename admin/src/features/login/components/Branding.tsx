import { BarChart3, BookOpen, Users } from 'lucide-react'

export function Branding() {
  return (
    <div className="hidden lg:block space-y-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">English Learning Admin</h1>
            <p className="text-gray-600">Hệ thống quản lý học tiếng Anh</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Quản lý người dùng</h3>
            <p className="text-gray-600 text-sm">Theo dõi và quản lý hơn 10,000+ học viên trên toàn hệ thống</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Nội dung học tập</h3>
            <p className="text-gray-600 text-sm">Quản lý thư viện với 5,000+ bài học và tài liệu</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Phân tích & Báo cáo</h3>
            <p className="text-gray-600 text-sm">Thống kê chi tiết về tiến độ học tập và hiệu suất</p>
          </div>
        </div>
      </div>
    </div>
  )
}
