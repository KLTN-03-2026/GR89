'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import type { IListeningProgress, IDiffPart } from '@/features/listening/types'
import type { StudySessionPayload } from '@/libs/apis/types'
import { IQuizResultData } from '@/features/quizz/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function doListeningQuiz(
  id: string,
  formDataDictationResult: IDiffPart[],
  formDataQuizResult: IQuizResultData[],
  studySession?: StudySessionPayload,
): Promise<ApiResponse<IListeningProgress>> {
  const response = await authorizedAxios.post<ApiResponse<IListeningProgress>>(`/listening/do/${id}`, {
    formDataDictationResult,
    formDataQuizResult,
    studySession,
  })
  return response.data
}
