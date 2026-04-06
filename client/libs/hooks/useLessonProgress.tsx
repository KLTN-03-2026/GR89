"use client"

import { useState, useEffect } from 'react'
import {
  IUserLearningPathProgress,
  ILevelProgress
} from '@/types'
import {
  getUserLearningProgress,
  getLevelProgress,
  startLesson,
  updateLessonProgress,
  completeLesson
} from '@/features/roadmap/services/roadmapApi'
import { useAuth } from '@/libs/contexts/AuthContext'
import { toast } from 'react-toastify'
import { notifyStreakIncrease } from '@/libs/streakToast'

export function useLessonProgress(levelId?: string) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<IUserLearningPathProgress[]>([])
  const [levelProgress, setLevelProgress] = useState<ILevelProgress | null>(null)
  const [loading, setLoading] = useState(false)

  // Load progress data
  const loadProgress = async () => {
    if (!user) return

    try {
      setLoading(true)

      if (levelId) {
        const [progressResponse, levelResponse] = await Promise.all([
          getUserLearningProgress(user._id, levelId),
          getLevelProgress(user._id, levelId)
        ])

        if (progressResponse.success && progressResponse.data) {
          setProgress(progressResponse.data)
        }

        if (levelResponse.success && levelResponse.data) {
          setLevelProgress(levelResponse.data)
        }
      } else {
        await getUserLearningProgress(user._id)
          .then(res => {
            if (res.success && res.data) {
              setProgress(res.data)
            }
          })
          .finally(() => {
            setLoading(false)
          })
      }
    } catch {
      toast.error('Không thể tải dữ liệu tiến độ')
    } finally {
      setLoading(false)
    }
  }

  // Start a lesson
  const startLessonHandler = async (lessonId: string) => {
    if (!user) return

    try {
      const response = await startLesson(user._id, lessonId)
      if (response.success && response.data) {
        // Update local state
        setProgress(prev => {
          const existing = prev.find(p => p.lessonId === lessonId)
          if (existing) {
            return prev.map(p =>
              p.lessonId === lessonId
                ? { ...p, ...response.data, status: 'in_progress' }
                : p
            )
          } else {
            return [...prev, response.data!]
          }
        })

        toast.success('Bắt đầu bài học thành công!')
        return response.data
      }
    } catch (error) {
      console.error('Error starting lesson:', error)
      toast.error('Không thể bắt đầu bài học')
    }
  }

  // Update lesson progress
  const updateProgress = async (
    lessonId: string,
    progressData: {
      progress?: number
      score?: number
      timeSpent?: number
      notes?: string
    }
  ) => {
    if (!user) return

    try {
      const response = await updateLessonProgress(user._id, lessonId, progressData)
      if (response.success && response.data) {
        // Update local state
        setProgress(prev =>
          prev.map(p =>
            p.lessonId === lessonId
              ? { ...p, ...response.data }
              : p
          )
        )

        return response.data
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Không thể cập nhật tiến độ')
    }
  }

  // Complete a lesson
  const completeLessonHandler = async (lessonId: string, score?: number) => {
    if (!user) return

    try {
      const response = await completeLesson(user._id, lessonId, score)
      if (response.success && response.data) {
        // Update local state
        setProgress(prev =>
          prev.map(p =>
            p.lessonId === lessonId
              ? { ...p, ...response.data, status: 'completed' }
              : p
          )
        )

        toast.success('Hoàn thành bài học thành công!')
        await notifyStreakIncrease()
        return response.data
      }
    } catch (error) {
      console.error('Error completing lesson:', error)
      toast.error('Không thể hoàn thành bài học')
    }
  }

  // Get lesson progress by lesson ID
  const getLessonProgress = (lessonId: string): IUserLearningPathProgress | null => {
    return progress.find(p => p.lessonId === lessonId) || null
  }

  // Get lesson status
  const getLessonStatus = (lessonId: string): 'not_started' | 'in_progress' | 'completed' | 'locked' => {
    const lessonProgress = getLessonProgress(lessonId)
    return lessonProgress?.status || 'not_started'
  }

  // Check if lesson is unlocked
  const isLessonUnlocked = (lessonId: string, prerequisites: string[] = []): boolean => {
    if (prerequisites.length === 0) return true

    return prerequisites.every(prereqId => {
      const prereqProgress = getLessonProgress(prereqId)
      return prereqProgress?.status === 'completed'
    })
  }

  // Load progress on mount
  useEffect(() => {
    loadProgress()
  }, [user, levelId])

  return {
    // Data
    progress,
    levelProgress,
    loading,

    // Actions
    loadProgress,
    startLesson: startLessonHandler,
    updateProgress,
    completeLesson: completeLessonHandler,

    // Helpers
    getLessonProgress,
    getLessonStatus,
    isLessonUnlocked
  }
}
