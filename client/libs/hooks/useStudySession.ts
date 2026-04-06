import { useCallback, useRef } from "react"
import type { StudySessionPayload } from '@/libs/apis/types'

export function useStudySession() {
  const startRef = useRef<number>(Date.now())

  const startSession = useCallback(() => {
    startRef.current = Date.now()
  }, [])

  const getSessionPayload = useCallback((): StudySessionPayload => {
    const startedAt = new Date(startRef.current).toISOString()
    const endedAt = new Date().toISOString()
    return { startedAt, endedAt }
  }, [])

  return {
    startSession,
    getSessionPayload,
  }
}

