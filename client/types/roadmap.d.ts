export interface ILearningLevels {
  _id: string;
  title: string;
  description: string;
  orderIndex: string;
  weeks: IWeeks[];
  isActive: boolean;
  isCompleted: boolean;
}

export interface IWeeks {
  _id: string;
  weekNumber: number
  title: string;
  description: string;
  lessons: ILessons[];
  isActive: boolean;
  isCompleted: boolean;
}

export interface ILessons {
  _id: string;
  title: string;
  description: string;
  lessonType: 'ipa' | 'grammar' | 'vocabulary' | 'listening' | 'speaking' | 'reading' | 'writing';
  lessonContentId: string;
  orderIndex: number;
  isCompleted: boolean;
  isActive: boolean;
}