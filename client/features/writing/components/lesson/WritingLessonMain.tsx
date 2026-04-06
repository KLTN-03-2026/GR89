'use client'
import { useState } from "react"
import LessonInformationCard from "./LessonInformationCard"
import ResultCard from "./ResultCard"
import VocabularyTipsCard from "./VocabularyTipsCard"
import WritingEditorCard from "./WritingEditorCard"
import WritingTipsCard from "./WritingTipsCard"
import { resultWriting, writing } from "@/types"

interface WritingLessonMainProps {
  writingData: writing
}

export function WritingLessonMain({ writingData }: WritingLessonMainProps) {
  const [result, setResult] = useState<resultWriting | null>(null)
  return (
    !result ?
      (<div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Lesson Info & Tips */}
          <div className="space-y-6">

            {/* Lesson Information Card */}
            <LessonInformationCard
              title={writingData.title}
              description={writingData.description}
              minWords={writingData.minWords}
              maxWords={writingData.maxWords}
              timeLimit={writingData.duration}
            />

            {/* writing Tips Card */}
            <WritingTipsCard structures={writingData.suggestedStructure} />

            {/* Vocabulary Card */}
            <VocabularyTipsCard vocabularys={writingData.suggestedVocabulary} />
          </div>

          <div className="xl:col-span-2 space-y-6">
            <WritingEditorCard
              minWords={writingData.minWords}
              setResult={setResult}
              _id={writingData._id}
            />
          </div>
        </div>
      </div>)
      :
      <ResultCard result={result} />
  )
}

