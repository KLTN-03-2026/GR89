import { BookOpen, Brain, Headphones, MessageSquare, Mic, PenTool, Sparkles, Target } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: 'Vocabulary',
      description: 'Học từ vựng theo chủ đề, flashcard thông minh, ôn tập theo đường cong망각',
      color: 'from-blue-500 to-cyan-500',
      image: '📖'
    },
    {
      icon: Brain,
      title: 'Grammar',
      description: 'Ngữ pháp từ cơ bản đến nâng cao, bài tập tương tác, giải thích chi tiết',
      color: 'from-purple-500 to-pink-500',
      image: '🧠'
    },
    {
      icon: BookOpen,
      title: 'Reading',
      description: 'Đọc hiểu đa dạng chủ đề, tra từ điển tích hợp, phân tích câu văn',
      color: 'from-green-500 to-emerald-500',
      image: '📰'
    },
    {
      icon: Headphones,
      title: 'Listening',
      description: 'Luyện nghe với AI, phụ đề tương tác, điều chỉnh tốc độ linh hoạt',
      color: 'from-orange-500 to-red-500',
      image: '🎧'
    },
    {
      icon: Mic,
      title: 'Speaking',
      description: 'Luyện phát âm với AI Azure, chấm điểm chính xác, feedback tức thì',
      color: 'from-pink-500 to-rose-500',
      image: '🎤'
    },
    {
      icon: PenTool,
      title: 'Writing',
      description: 'Luyện viết essay, AI chấm bài chi tiết, gợi ý cải thiện văn phong',
      color: 'from-indigo-500 to-blue-500',
      image: '✍️'
    }
  ]

  const extraFeatures = [
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Trợ lý AI hỗ trợ 24/7, giải đáp mọi thắc mắc về tiếng Anh',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Target,
      title: 'Lộ trình cá nhân hóa',
      description: 'Học tập theo trình độ, mục tiêu và thời gian của bạn',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: MessageSquare,
      title: 'Chat với giáo viên',
      description: 'Kết nối trực tiếp với giáo viên có kinh nghiệm',
      color: 'from-blue-500 to-purple-500'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            6 Kỹ Năng Toàn Diện
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Phát triển đồng đều cả 6 kỹ năng tiếng Anh với phương pháp học tập hiện đại và công nghệ AI
          </p>
        </div>

        {/* Main 6 Skills */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg`}>
                {feature.image}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Extra Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {extraFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

