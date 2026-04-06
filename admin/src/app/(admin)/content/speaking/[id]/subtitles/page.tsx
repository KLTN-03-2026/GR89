'use client'
import { useParams } from 'next/navigation'
import { SpeakingSubtitlesManagement } from '@/features/speaking'

export default function SpeakingSubtitlesPage() {
  const params = useParams()
  const speakingId = params.id as string

  return <SpeakingSubtitlesManagement speakingId={speakingId} />
}
