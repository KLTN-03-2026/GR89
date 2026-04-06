'use client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/libs/contexts/AuthContext'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CTASection() {
  const router = useRouter()
  const { user } = useAuth()


  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-medium">Bắt đầu hành trình của bạn ngay hôm nay</span>
        </div>

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Sẵn Sàng Chinh Phục Tiếng Anh?
        </h2>

        {/* Description */}
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Tham gia cùng 50,000+ học viên đang học tiếng Anh thông minh với AI.
          Miễn phí dùng thử, không cần thẻ tín dụng.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-10 py-6 text-lg shadow-2xl"
            onClick={handleGetStarted}
          >
            Bắt đầu ngay
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span>Miễn phí mãi mãi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span>Không cần thẻ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span>Hủy bất kỳ lúc nào</span>
          </div>
        </div>
      </div>
    </section>
  )
}

