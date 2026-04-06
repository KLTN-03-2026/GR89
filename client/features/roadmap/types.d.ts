// Bài học trong roadmap
export interface IPALesson {
  _id: string
  type: 'ipa' | 'vocabulary' | 'grammar' | 'reading' | 'listening' | 'speaking' | 'writing' | 'review'
  title: string
  isUnlocked: boolean
  isCompleted: boolean
  progress: number
}

// Chủ đề (unit) trong roadmap
export interface IPATopic {
  _id: string
  title: string
  description: string
  icon: string
  status: 'in-progress' | 'locked' | 'completed'
  progress: number
  lessons: IPALesson[]
}

// Nhóm các bài liên tiếp cùng type
export interface IPALessonGroup {
  type: string
  lessons: IPALesson[]
  startIndex: number
}
