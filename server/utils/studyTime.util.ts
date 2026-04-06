export interface StudySessionPayload {
  startedAt?: string | Date
  endedAt?: string | Date
}

export const calculateStudyTimeSeconds = (payload?: StudySessionPayload): number => {
  if (!payload?.startedAt || !payload?.endedAt) {
    return 0
  }

  const start = new Date(payload.startedAt).getTime()
  const end = new Date(payload.endedAt).getTime()

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return 0
  }

  return Math.max(0, Math.round((end - start) / 1000))
}

