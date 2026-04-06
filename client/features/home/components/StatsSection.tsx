export function StatsSection() {
  const stats = [
    { value: '50,000+', label: 'Học viên', icon: '👥' },
    { value: '1,000+', label: 'Bài học', icon: '📚' },
    { value: '4.9/5', label: 'Đánh giá', icon: '⭐' },
    { value: '95%', label: 'Hoàn thành', icon: '🎯' }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

