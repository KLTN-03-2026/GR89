import type { Metadata } from 'next'
import { HeroSection, StatsSection, FeaturesSection, PricingSection, TestimonialsSection, CTASection } from '@/features/home'

export const metadata: Metadata = {
  title: 'English Mastery - Nền tảng học tiếng Anh trực tuyến hàng đầu Việt Nam',
  description: 'Học tiếng Anh hiệu quả với AI, lộ trình cá nhân hóa, 6 kỹ năng toàn diện. Vocabulary, Grammar, Reading, Listening, Speaking, Writing. Miễn phí dùng thử.',
  keywords: 'học tiếng anh, học tiếng anh online, english learning, AI english, học phát âm, luyện nghe tiếng anh, luyện nói tiếng anh',
  openGraph: {
    title: 'English Mastery - Học tiếng Anh thông minh với AI',
    description: 'Nền tảng học tiếng Anh trực tuyến với AI, lộ trình cá nhân hóa, 6 kỹ năng toàn diện',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'English Mastery'
  }
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </main>
  )
}
