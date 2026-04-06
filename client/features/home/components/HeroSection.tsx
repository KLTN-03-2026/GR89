'use client'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Sparkles, Star } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function HeroSection() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null
    const token = userData ? JSON.parse(userData).accessToken : null
    setIsAuthenticated(!!token)
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Nền tảng học tiếng Anh #1 Việt Nam</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Học Tiếng Anh Thông Minh với{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 max-w-xl">
                Nâng cao 6 kỹ năng tiếng Anh với lộ trình cá nhân hóa, AI hỗ trợ 24/7,
                và phương pháp học tập khoa học. Từ A1 đến C2.
              </p>
            </div>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                '✅ Lộ trình cá nhân hóa',
                '✅ AI chấm bài tức thì',
                '✅ 6 kỹ năng toàn diện',
                '✅ Miễn phí dùng thử'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm font-medium">
                  {feature}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 shadow-xl"
                onClick={handleGetStarted}
              >
                Bắt đầu ngay
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 bg-opacity-0 border-white text-white hover:bg-white/10 font-bold px-8">
                <Play className="mr-2 w-5 h-5" />
                Xem demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-400"></div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-yellow-300">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-sm text-blue-100 mt-1">
                  <span className="font-bold">50,000+</span> học viên tin tưởng
                </p>
              </div>
            </div>
          </div>

          {/* Right Image/Illustration */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main Dashboard Image */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 transform hover:scale-105 transition-transform duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Image src={"/images/dashboard_preview.png"} alt="dashboard_preview" className='w-full h-full aspect-video' width={500} height={500} />
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-bounce">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                    🎯
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Chuỗi ngày</p>
                    <p className="font-bold text-blue-600">15 ngày</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                    ⭐
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Điểm số</p>
                    <p className="font-bold text-green-600">1,250</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
        </svg>
      </div>
    </section>
  )
}

