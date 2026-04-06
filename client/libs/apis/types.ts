export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export interface StudySessionPayload {
  startedAt: string
  endedAt: string
}
