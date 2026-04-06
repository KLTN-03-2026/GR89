'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import type { IListeningProgress } from '@/types/listening'
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
  studySession?: StudySessionPayload
): Promise<ApiResponse<IListeningProgress>> {
  const response = await authorizedAxios.post<ApiResponse<IListeningProgress>>(`/listening/do/${id}`, {
    time,
    result,
    studySession
  })
  return response.data
}
