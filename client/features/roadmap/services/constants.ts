// Cấu hình màu sắc theo loại bài học
export const lessonTypeConfig = {
  ipa: {
    color: 'bg-cyan-500',
    hoverColor: 'hover:bg-cyan-600',
    shadowColor: 'shadow-cyan-500/50',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600'
  },
  vocabulary: {
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    shadowColor: 'shadow-orange-500/50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  grammar: {
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    shadowColor: 'shadow-purple-500/50',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  listening: {
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    shadowColor: 'shadow-blue-500/50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  speaking: {
    color: 'bg-pink-500',
    hoverColor: 'hover:bg-pink-600',
    shadowColor: 'shadow-pink-500/50',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  reading: {
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
    shadowColor: 'shadow-emerald-500/50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  writing: {
    color: 'bg-rose-500',
    hoverColor: 'hover:bg-rose-600',
    shadowColor: 'shadow-rose-500/50',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600'
  },
  review: {
    color: 'bg-teal-500',
    hoverColor: 'hover:bg-teal-600',
    shadowColor: 'shadow-teal-500/50',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-600'
  },
}

// Nhãn tiếng Việt cho từng loại bài
export const typeLabel: Record<string, string> = {
  ipa: 'phiên âm',
  vocabulary: 'từ vựng',
  grammar: 'ngữ pháp',
  listening: 'bài nghe',
  speaking: 'bài nói',
  reading: 'bài đọc',
  writing: 'bài viết',
  review: 'ôn tập',
}

// Số bài liên tiếp cùng type tối thiểu để gom nhóm
export const GROUP_THRESHOLD = 2
