import type { Listening } from '@/features/listening/types'
import type { DataListening, ListeningQuizItem } from '@/features/listening/services/api'

export function getListeningAudioId(listening: Listening): string {
  if (typeof listening.audio === 'string') return listening.audio
  return listening.audio?._id ?? ''
}

export function buildListeningUpdatePayload(listening: Listening, quiz: ListeningQuizItem[]): DataListening {
  return {
    title: listening.title,
    description: listening.description,
    subtitle: listening.subtitle,
    subtitleVi: listening.subtitleVi,
    level: listening.level,
    audio: getListeningAudioId(listening),
    quiz,
  }
}
