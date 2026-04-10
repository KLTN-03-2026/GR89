'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import type { IListeningProgress } from '@/features/listening/types'
import type { StudySessionPayload } from '@/libs/apis/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

interface IResult {
  index: number
  text: string
  isCorrect: boolean
}

export async function doListeningQuiz(
  id: string,
  time: number,
  result: IResult[],
  studySession?: StudySessionPayload,
  mode: 'quiz' | 'dictation' = 'dictation'
): Promise<ApiResponse<IListeningProgress>> {
  const response = await authorizedAxios.post<ApiResponse<IListeningProgress>>(`/listening/do/${id}`, {
    time,
    result,
    studySession,
    mode
  })
  return response.data
}
