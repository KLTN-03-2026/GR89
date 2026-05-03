'use client'

import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

export function useLessonContext() {
  const pathname = usePathname()

  const lessonContext = useMemo(() => {
    if (!pathname) {
      return { lessonId: undefined, lessonType: undefined }
    }

    const matchers: Array<{
      lessonType: 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'listening' | 'ipa'
      regex: RegExp
    }> = [
      { lessonType: 'reading', regex: /^\/skills\/reading\/(?:lesson|result)\/([^/]+)\/?$/ },
      { lessonType: 'listening', regex: /^\/skills\/listening\/(?:quiz|result)\/([^/]+)\/?$/ },
      { lessonType: 'listening', regex: /^\/skills\/listening\/([^/]+)\/?$/ },
      { lessonType: 'speaking', regex: /^\/skills\/speaking\/(?:lesson|result)\/([^/]+)\/?$/ },
      { lessonType: 'writing', regex: /^\/skills\/writing\/(?:lesson|result)\/([^/]+)\/?$/ },
      { lessonType: 'vocabulary', regex: /^\/study\/vocabulary\/learn\/([^/]+)\/?$/ },
      { lessonType: 'vocabulary', regex: /^\/study\/vocabulary\/([^/]+)\/?$/ },
      { lessonType: 'grammar', regex: /^\/study\/grammar\/([^/]+)\/?$/ },
      { lessonType: 'ipa', regex: /^\/study\/ipa\/learn\/([^/]+)\/?$/ },
      { lessonType: 'ipa', regex: /^\/study\/ipa\/([^/]+)\/?$/ },
    ]

    for (const { lessonType, regex } of matchers) {
      const matched = pathname.match(regex)
      if (!matched?.[1]) continue

      const lessonId = matched[1]

      // Skip static route names (avoid treating listing pages as lesson IDs)
      if (['lesson', 'result', 'quiz', 'learn', 'reading', 'listening', 'speaking', 'writing', 'vocabulary', 'grammar', 'ipa', 'skills', 'study'].includes(lessonId)) {
        continue
      }

      return { lessonId, lessonType }
    }

    return { lessonId: undefined, lessonType: undefined }
  }, [pathname])

  return lessonContext
}

