'use client'
import { useState, useEffect } from 'react'
import { SpeakingData } from '@/features/speaking/types'
import { LessonVideoSection } from './LessonVideoSection'
import { LessonProgressIndicator } from './LessonProgressIndicator'
import { SentenceCard } from './SentenceCard'
import { SpeakingRecordingPanel } from './SpeakingRecordingPanel'
import { FinalResultsView } from './FinalResultsView'
import type { SentenceEvaluation } from './types'
import { useStudySession } from '@/libs/hooks/useStudySession'
import { parseSrtTimestamp } from './utils'
import { saveHighestSpeakingScore } from '../../services/speakingApi'
import { toast } from 'react-toastify'

interface SpeakingLessonPageInternalProps {
  speaking: SpeakingData
}

export function SpeakingLessonPage({ speaking }: SpeakingLessonPageInternalProps) {
  const { startSession, getSessionPayload } = useStudySession()
  const [isSubmittingAll, setIsSubmittingAll] = useState(false)
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0)
  const [sentenceResults, setSentenceResults] = useState<SentenceEvaluation[]>(speaking.subtitleIds.map((subtitleId, index) => ({
    index,
    score: 0,
    words: [],
    audioBlob: undefined,
    sentence: subtitleId.english,
    aiFeedback: ''
  })))

  const [showFinalResults, setShowFinalResults] = useState(false)

  useEffect(() => {
    startSession()
  })

  const currentSubtitle = speaking.subtitleIds[currentSubtitleIndex] || null

  const handleRetry = () => {
    setShowFinalResults(false)
    setSentenceResults(speaking.subtitleIds.map((subtitleId, index) => ({
      index,
      score: 0,
      words: [],
      audioBlob: undefined,
      sentence: subtitleId.english,
      aiFeedback: ''
    })))
    setCurrentSubtitleIndex(0)
  }

  if (showFinalResults) {
    const sortedResults = [...sentenceResults].sort((a, b) => a.index - b.index)

    return (
      <FinalResultsView
        results={sortedResults}
        onRetry={handleRetry}
      />
    )
  }

  const handleSubmit = async () => {
    setIsSubmittingAll(true)
    await saveHighestSpeakingScore(speaking._id, sentenceResults, getSessionPayload())
      .then(() => {
        toast.success('Chúc mừng bạn đã hoàn thành bài speaking')
      })
      .finally(() => {
        setShowFinalResults(true)
        setIsSubmittingAll(false)
      })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <LessonVideoSection
        subtitle={currentSubtitle}
        videoUrl={speaking.videoUrl}
      />

      <LessonProgressIndicator
        currentIndex={currentSubtitleIndex}
        total={speaking.subtitleIds.length}
      />

      <SentenceCard
        subtitle={currentSubtitle}
        currentIndex={currentSubtitleIndex}
      />

      <SpeakingRecordingPanel
        maxDuration={parseSrtTimestamp(currentSubtitle.end) - parseSrtTimestamp(currentSubtitle.start)}
        currentSubtitle={currentSubtitle}
        currentSubtitleIndex={currentSubtitleIndex}
        lessonSubtitlesLength={speaking.subtitleIds.length}
        sentenceCurrent={sentenceResults[currentSubtitleIndex]}
        setSentenceResults={setSentenceResults}
        setCurrentSubtitleIndex={setCurrentSubtitleIndex}
        submit={handleSubmit}
        isSubmittingAll={isSubmittingAll}
      />

      {/* {!assessmentResult && (
        <LessonNavigation
          currentSubtitleIndex={currentSubtitleIndex}
          total={speaking.subtitleIds.length}
          setCurrentSubtitleIndex={setCurrentSubtitleIndex}
          setAssessmentResult={setAssessmentResult}
          setReplayTrigger={setReplayTrigger}
        />
      )} */}
    </div>
  )
}


