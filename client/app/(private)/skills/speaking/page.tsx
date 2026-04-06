import { SpeakingPage, getSpeakingData } from '@/features/speaking'

export default async function page() {
  const { overview, speakings } = await getSpeakingData()

  return <SpeakingPage overview={overview} speakings={speakings} />
}
