'use client'

import { resultWriting } from '@/features/writing/types'
import authorizedAxios from '@/libs/apis/authorizedAxios'
import type { StudySessionPayload } from '@/libs/apis/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function submitWriting(
  id: string,
  data: { content: string },
  studySession?: StudySessionPayload
): Promise<ApiResponse<resultWriting>> {
  const response = await authorizedAxios.post<ApiResponse<resultWriting>>(`/writing/evaluate/${id}`, {
    ...data,
    studySession
  })
  return response.data
}
