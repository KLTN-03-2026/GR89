'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { submitSpeakingPractice } from '@/features/speaking/services/speakingApi'
import { MediaSubtitlePreviewEntry, Speaking } from '@/types/speaking'
import { useAuth } from '@/libs/contexts/AuthContext'
import { LessonVideoSection } from './LessonVideoSection'
import { LessonProgressIndicator } from './LessonProgressIndicator'
import { SentenceCard } from './SentenceCard'
import { SpeakingRecordingPanel } from './SpeakingRecordingPanel'
import { FinalResultsView } from './FinalResultsView'
import { LessonNavigation } from './LessonNavigation'
import type { AssessmentResult, SentenceEvaluation } from './types'
import { useStudySession } from '@/libs/hooks/useStudySession'
import { parseSrtTimestamp } from './utils'

interface SpeakingLessonPageInternalProps {
  speaking: Speaking
}

export function SpeakingLessonPage({ speaking }: SpeakingLessonPageInternalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { startSession, getSessionPayload } = useStudySession()

  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0)
  const [completedSubtitles, setCompletedSubtitles] = useState<number[]>([])
  const [scores, setScores] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replayTrigger, setReplayTrigger] = useState(0)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [sentenceResults, setSentenceResults] = useState<SentenceEvaluation[]>([])
  const sentenceResultsRef = useRef<SentenceEvaluation[]>([])
  const [showFinalResults, setShowFinalResults] = useState(false)
  const [finalAverageScore, setFinalAverageScore] = useState<number>(0)
  const [finalResults, setFinalResults] = useState<SentenceEvaluation[]>([])

  useEffect(() => {
    startSession()
  })

  const lessonSubtitles = useMemo<MediaSubtitlePreviewEntry[]>(() => {
    if (!speaking) return []

    if (speaking.subtitleIds && speaking.subtitleIds.length > 0) {
      return speaking.subtitleIds.map((subtitle) => ({
        english: subtitle.english,
        vietnamese: subtitle.vietnamese,
        start: parseSrtTimestamp(subtitle.start as unknown as string),
        end: parseSrtTimestamp(subtitle.end as unknown as string),
        phonetic: subtitle.phonetic,
      }))
    }

    const preview = speaking.videoUrl?.subtitles?.[0]?.preview
    if (!preview || preview.length === 0) return []
    return preview.map((entry, index) => ({
      _id: entry._id || `preview-${index}`,
      speakingId: speaking._id,
      orderIndex: index + 1,
      english: entry.english || '',
      phonetic: entry.phonetic || '',
      vietnamese: entry.vietnamese || '',
      start: entry.start ? parseSrtTimestamp(entry.start as unknown as string) : undefined,
      end: entry.end ? parseSrtTimestamp(entry.end as unknown as string) : undefined,
    }))
  }, [speaking])


  const currentSubtitle = lessonSubtitles[currentSubtitleIndex] || null
  const saveAllResultsToServer = async (resultsToSave: Array<{ index: number; score: number; audioBlob?: File }>) => {
    const savePromises = resultsToSave
      .filter(result => result.audioBlob)
      .map(async (result) => {
        try {
          const formData = new FormData()
          formData.append('audio', result.audioBlob!, 'recording.wav')
          formData.append('sentenceId', result.index.toString())
          await submitSpeakingPractice(speaking._id, result.index.toString(), formData)
        } catch (error) {
          console.error(`Error saving sentence ${result.index}:`, error)
        }
      })

    await Promise.all(savePromises)
  }

  if (showFinalResults) {
    const resultsToDisplay = finalResults.length > 0 ? finalResults : sentenceResults
    const sortedResults = [...resultsToDisplay].sort((a, b) => a.index - b.index)

    return (
      <FinalResultsView
        averageScore={finalAverageScore}
        results={sortedResults}
        router={router}
        setShowFinalResults={setShowFinalResults}
        setCurrentSubtitleIndex={setCurrentSubtitleIndex}
        setCompletedSubtitles={setCompletedSubtitles}
        setScores={setScores}
        setAssessmentResult={setAssessmentResult}
        setSentenceResults={setSentenceResults}
        setFinalAverageScore={setFinalAverageScore}
        setFinalResults={setFinalResults}
        setReplayTrigger={setReplayTrigger}
        sentenceResultsRef={sentenceResultsRef}
        saveAllResultsToServer={saveAllResultsToServer}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <LessonVideoSection
        subtitle={currentSubtitle}
        videoSrc={speaking.videoUrl?.url}
        replayTrigger={replayTrigger}
        setReplayTrigger={setReplayTrigger}
      />

      <LessonProgressIndicator
        currentIndex={currentSubtitleIndex}
        total={lessonSubtitles.length}
      />

      <SentenceCard
        subtitle={currentSubtitle}
        isCompleted={completedSubtitles.includes(currentSubtitleIndex)}
        currentIndex={currentSubtitleIndex}
      />

      <SpeakingRecordingPanel
        maxDuration={currentSubtitle?.end ? (currentSubtitle.end as number) - (currentSubtitle.start as number) + 2 : 3}
        currentSubtitle={currentSubtitle}
        currentSubtitleIndex={currentSubtitleIndex}
        lessonSubtitlesLength={lessonSubtitles.length}
        speakingId={speaking._id}
        assessmentResult={assessmentResult}
        isSubmitting={isSubmitting}
        scores={scores}
        user={user}
        setAssessmentResult={setAssessmentResult}
        setIsSubmitting={setIsSubmitting}
        setSentenceResults={setSentenceResults}
        setScores={setScores}
        setCompletedSubtitles={setCompletedSubtitles}
        setCurrentSubtitleIndex={setCurrentSubtitleIndex}
        setReplayTrigger={setReplayTrigger}
        setShowFinalResults={setShowFinalResults}
        setFinalAverageScore={setFinalAverageScore}
        setFinalResults={setFinalResults}
        sentenceResultsRef={sentenceResultsRef}
        saveAllResultsToServer={saveAllResultsToServer}
        getStudySessionPayload={getSessionPayload}
      />

      {!assessmentResult && (
        <LessonNavigation
          currentSubtitleIndex={currentSubtitleIndex}
          total={lessonSubtitles.length}
          setCurrentSubtitleIndex={setCurrentSubtitleIndex}
          setAssessmentResult={setAssessmentResult}
          setReplayTrigger={setReplayTrigger}
        />
      )}
    </div>
  )
}


