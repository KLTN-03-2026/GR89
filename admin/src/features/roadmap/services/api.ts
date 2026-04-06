import { ReorderRoadmapTopicItem, RoadmapAvailableLesson, RoadmapLesson, RoadmapLessonCreateType, RoadmapLessonType, RoadmapTopic } from "../types"
import AuthorizedAxios from '@/lib/apis/authorizrAxios'

/** Shape response API (khớp lib/apis/api) */
interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
    hasNext?: boolean
    hasPrev?: boolean
    next?: number | null
    prev?: number | null
  }
}

export async function getRoadmapTopics(): Promise<ApiResponse<RoadmapTopic[]>> {
  const response = await AuthorizedAxios.get('/roadmap/topics')
  return response.data as ApiResponse<RoadmapTopic[]>
}

export async function getRoadmapTopicById(topicId: string): Promise<ApiResponse<RoadmapTopic>> {
  const response = await AuthorizedAxios.get(`/roadmap/topics/${topicId}`)
  return response.data as ApiResponse<RoadmapTopic>
}

export async function getRoadmapTopicLessons(topicId: string): Promise<ApiResponse<RoadmapLesson[]>> {
  const response = await AuthorizedAxios.get(`/roadmap/topics/${topicId}/lessons`)
  return response.data as ApiResponse<RoadmapLesson[]>
}

export async function createRoadmapTopic(
  title: string,
  description: string,
  icon: string = '📚'
): Promise<ApiResponse<RoadmapTopic>> {
  const response = await AuthorizedAxios.post('/roadmap/topics', { title, description, icon })
  return response.data as ApiResponse<RoadmapTopic>
}

export async function updateRoadmapTopic(
  topicId: string,
  title: string,
  description: string,
  icon?: string
): Promise<ApiResponse<RoadmapTopic>> {
  const response = await AuthorizedAxios.put(`/roadmap/topics/${topicId}`, { title, description, icon })
  return response.data as ApiResponse<RoadmapTopic>
}

export async function deleteRoadmapTopic(topicId: string): Promise<ApiResponse<{ message: string }>> {
  const response = await AuthorizedAxios.delete(`/roadmap/topics/${topicId}`)
  return response.data as ApiResponse<{ message: string }>
}

export async function updateRoadmapTopicVisibility(
  topicId: string,
  isActive: boolean
): Promise<ApiResponse<RoadmapTopic>> {
  const response = await AuthorizedAxios.put(`/roadmap/topics/${topicId}`, { isActive })
  return response.data as ApiResponse<RoadmapTopic>
}

export async function reorderRoadmapTopics(
  topics: ReorderRoadmapTopicItem[]
): Promise<ApiResponse<RoadmapTopic[]>> {
  const response = await AuthorizedAxios.put('/roadmap/topics/reorder', { topics })
  return response.data as ApiResponse<RoadmapTopic[]>
}

// NOTE: backend chưa tích hợp lesson roadmap, các API dưới đây dùng endpoint dự kiến để giữ tương thích UI hiện tại.
export async function getRoadmapLessonsByType(
  type: RoadmapLessonType
): Promise<ApiResponse<RoadmapAvailableLesson[]>> {
  const response = await AuthorizedAxios.get(`/roadmap/lessons/type?type=${encodeURIComponent(type)}`)
  return response.data as ApiResponse<RoadmapAvailableLesson[]>
}

export async function createLesson(
  roadmapId: string,
  type: RoadmapLessonCreateType,
  lessonId: string
): Promise<ApiResponse<RoadmapTopic>> {
  const response = await AuthorizedAxios.post(`/roadmap/topics/${roadmapId}/lessons`, { type, lessonId })
  return response.data as ApiResponse<RoadmapTopic>
}

export interface ReorderRoadmapLessonItem {
  lessonId: string
  orderIndex: number
}

export async function reorderRoadmapLessons(
  topicId: string,
  lessons: ReorderRoadmapLessonItem[]
): Promise<ApiResponse<RoadmapTopic>> {
  const response = await AuthorizedAxios.put(`/roadmap/topics/${topicId}/lessons/reorder`, { lessons })
  return response.data as ApiResponse<RoadmapTopic>
}

export async function deleteLesson(roadmapId: string, lessonId: string): Promise<ApiResponse<RoadmapTopic>> {
  const response = await AuthorizedAxios.delete(`/roadmap/topics/${roadmapId}/lessons/${lessonId}`)
  return response.data as ApiResponse<RoadmapTopic>
}

export async function updateLessonVisibility(
  roadmapId: string,
  lessonId: string,
  isActive: boolean
): Promise<ApiResponse<RoadmapLesson>> {
  const response = await AuthorizedAxios.patch(`/roadmap/topics/${roadmapId}/lessons/${lessonId}/visibility`, { isActive })
  return response.data as ApiResponse<RoadmapLesson>
}

export async function updateLessonVip(
  lessonId: string,
  isVipRequired: boolean
): Promise<ApiResponse<RoadmapLesson>> {
  const response = await AuthorizedAxios.patch(`/roadmap/lessons/${lessonId}/vip`, { isVipRequired })
  return response.data as ApiResponse<RoadmapLesson>
}
