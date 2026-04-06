import { BookOpen, Eye, FileText, Headphones, Mic, PenTool, Target, Volume2 } from 'lucide-react'
import type { IPALesson } from '../types'

export const getLessonIcon = (type: IPALesson['type']) => {
  const lessonTypeIcon = {
    "ipa": <Volume2 className="w-6 h-6" />,
    "grammar": <FileText className="w-6 h-6" />,
    "listening": <Headphones className="w-6 h-6" />,
    "speaking": <Mic className="w-6 h-6" />,
    "reading": <Eye className="w-6 h-6" />,
    "writing": <PenTool className="w-6 h-6" />,
    "review": <Target className="w-6 h-6" />,
    "vocabulary": <BookOpen className="w-6 h-6" />,
  }
  return lessonTypeIcon[type]
}

export const getLessonLink = (type: IPALesson['type'], lessonId: string) => {
  const lessonLink = {
    "ipa": `/study/${type}/learn/${lessonId}`,
    "grammar": `/study/${type}/${lessonId}`,
    "vocabulary": `/study/${type}/${lessonId}`,
    "listening": `/skills/${type}/${lessonId}`,
    "speaking": `/skills/${type}/${lessonId}`,
    "reading": `/skills/${type}/${lessonId}`,
    "writing": `/skills/${type}/${lessonId}`,
    "review": `/skills/${type}/${lessonId}`,
  }

  return lessonLink[type as keyof typeof lessonLink]
}
