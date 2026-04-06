import { SpeakingHeader } from './SpeakingHeader'
import { SpeakingTopic } from './SpeakingTopic'
import { SpeakingOverview } from '@/libs/apis/api'
import { Speaking } from "@/features/speaking/types";

interface SpeakingPageProps {
  overview: SpeakingOverview
  speakings: Speaking[]
}

export function SpeakingPage({ overview, speakings }: SpeakingPageProps) {
  return (
    <>
      <SpeakingHeader overview={overview} />
      <SpeakingTopic speakings={speakings} />
    </>
  )
}

