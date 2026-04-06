export type RoadmapLessonType = 'vocabulary' | 'grammar' | 'ipa' | 'listening' | 'speaking' | 'reading' | 'writing' | 'review' | 'quiz'
export type RoadmapLessonCreateType = 'vocabulary' | 'grammar' | 'ipa' | 'listening' | 'speaking' | 'reading' | 'writing' | 'review'

export type RoadmapTopic = {
  _id: string;
  title: string;
  description: string;
  icon?: string;
  lessonsCount?: number;
  isActive: boolean;
  orderIndex: number;
  lessons?: RoadmapLesson[];
}

export type RoadmapLesson = {
  _id: string;
  lessonId?: string;
  title: string;
  description: string;
  type: RoadmapLessonType;
  orderIndex: number;
  isActive: boolean;
  isVipRequired?: boolean;
}

export interface RoadmapAvailableLesson {
  _id: string
  title: string
  description?: string
}

export interface ReorderRoadmapTopicItem {
  topicId: string
  orderIndex: number
}
