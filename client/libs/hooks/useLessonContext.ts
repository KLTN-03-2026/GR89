'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export function useLessonContext() {
  const pathname = usePathname()

  const lessonContext = useMemo(() => {
    if (!pathname) {
      return { lessonId: undefined, lessonType: undefined }
    }

    // Lấy _id là segment cuối cùng trong URL
    const segments = pathname.split('/').filter(Boolean)
    const _id = segments[segments.length - 1] || undefined

    if (!_id) {
      return { lessonId: undefined, lessonType: undefined }
    }

    // Detect lesson type từ pathname
    if (pathname.includes('/skills/reading/lesson/')) {
      return { lessonId: _id, lessonType: 'reading' as const }
    }
    if (pathname.includes('/skills/listening/') && !pathname.includes('/result/')) {
      return { lessonId: _id, lessonType: 'listening' as const }
    }
    if (pathname.includes('/skills/speaking/lesson/')) {
      return { lessonId: _id, lessonType: 'speaking' as const }
    }
    if (pathname.includes('/skills/writing/lesson')) {
      return { lessonId: _id, lessonType: 'writing' as const }
    }
    if (pathname.includes('/study/vocabulary/')) {
      return { lessonId: _id, lessonType: 'vocabulary' as const }
    }
    if (pathname.includes('/study/grammar/')) {
      return { lessonId: _id, lessonType: 'grammar' as const }
    }
    if (pathname.includes('/study/ipa/')) {
      return { lessonId: _id, lessonType: 'ipa' as const }
    }

    return { lessonId: undefined, lessonType: undefined }
  }, [pathname])

  return lessonContext
}

