'use client'

import authorizedAxios from '@/libs/apis/authorizedAxios'
import type { StudySessionPayload } from '@/libs/apis/types'
import { IIpa } from '../types'

interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message: string
}

export async function assessIpaPronunciation(
  referenceText: string,
  audio: File,
  ipaId: string
): Promise<ApiResponse<unknown>> {
  const formData = new FormData()
  formData.append('referenceText', referenceText)
  formData.append('ipaId', ipaId)
  formData.append('audio', audio)

  const response = await authorizedAxios.post<ApiResponse<unknown>>(
    '/ipa/assess-pronunciation',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return response.data
}

export async function saveHighestIpaScore(
  lessonId: string,
  score: number,
  studySession: StudySessionPayload
): Promise<ApiResponse<{
  isNewRecord: boolean
  currentScore: number
  previousBest?: number
  progress: {
    _id: string
    userId: string
    ipaId: string
    progress: number
    createdAt?: Date
    updatedAt?: Date
  }
}>> {
  const response = await authorizedAxios.post(
    `/ipa/users/save-highest-score/${lessonId}`,
    {
      score,
      studySession
    }
  )
  return response.data
}

export async function getIpaSound(sound: string): Promise<ApiResponse<IIpa>> {
  const response = await authorizedAxios.get(`/ipa/user/sound/${sound}`)
  return response.data
}
