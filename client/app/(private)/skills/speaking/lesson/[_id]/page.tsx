import { SpeakingLesson, getSpeakingLesson } from '@/features/speaking'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const speaking = await getSpeakingLesson(_id)

  if (!speaking) return null

  return <SpeakingLesson speaking={speaking} />
}