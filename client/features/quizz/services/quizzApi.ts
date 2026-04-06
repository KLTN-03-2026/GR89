'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import type { IQuizResultData } from '../types'
import type { GrammarProgress } from '@/features/grammar/types'
import type { ReadingProgress } from '@/features/reading/types'
import type { StudySessionPayload } from '@/libs/apis/types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function doVocabularyQuiz(
  topicId: string,
  quizResults: IQuizResultData[],
  studySession?: StudySessionPayload
): Promise<ApiResponse<null>> {
  const response = await authorizedAxios.post<ApiResponse<null>>(`/vocabulary/${topicId}/do`, {
    quizResults,
    studySession
  })
  return response.data
}

export async function doGrammarQuiz(
  id: string,
  quizResults: IQuizResultData[],
  studySession?: StudySessionPayload
): Promise<ApiResponse<GrammarProgress>> {
  const response = await authorizedAxios.post<ApiResponse<GrammarProgress>>(`/grammar/quizzes/${id}/do`, {
    quizResults,
    studySession
  })
  return response.data
}

export async function doReadingQuiz(
  id: string,
  quizResults: IQuizResultData[],
  studySession?: StudySessionPayload
): Promise<ApiResponse<ReadingProgress>> {
  const response = await authorizedAxios.post<ApiResponse<ReadingProgress>>(`/reading/${id}/do`, {
    quizResults,
    studySession
  })
  return response.data
}
