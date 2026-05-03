import { Star, Quote } from 'lucide-react'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Sinh viên',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=3b82f6&color=fff',
      rating: 5,
      content: 'English Mastery giúp mình cải thiện Speaking từ 5.0 lên 7.5 IELTS chỉ sau 3 tháng! AI chấm phát âm cực kỳ chính xác và chi tiết.',
      achievement: 'IELTS 7.5'
    },
    {
      name: 'Trần Thị B',
      role: 'Nhân viên văn phòng',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=10b981&color=fff',
      rating: 5,
      content: 'Lộ trình học tập rất khoa học, phù hợp với lịch làm việc bận rộn của mình. AI Assistant hỗ trợ 24/7 rất tiện lợi!',
      achievement: 'TOEIC 850'
    },
    {
      name: 'Lê Minh C',
      role: 'Du học sinh',
      avatar: 'https://ui-avatars.com/api/?name=Le+Minh+C&background=f59e0b&color=fff',
      rating: 5,
      content: 'Bài tập Writing được AI chấm chi tiết, góp ý cải thiện cụ thể. Giúp mình tự tin hơn khi viết essay tiếng Anh.',
      achievement: 'Đậu học bổng'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Học Viên Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hơn 50,000 học viên đã cải thiện tiếng Anh với ActiveLearning
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-blue-100">
                <Quote className="w-12 h-12" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Achievement Badge */}
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                🏆 {testimonial.achievement}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 border-t pt-6">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

