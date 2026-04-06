'use client'

import { useRouter, useSearchParams } from "next/navigation"
import Flashcard from "./Flashcard"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, RotateCcw, Volume2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { playAudio } from "@/libs/utils"
import { VocabularyTopics } from "@/types/vocabulary"

interface VocabularyLearningProps {
  topic: VocabularyTopics
}

export function VocabularyLearning({ topic }: VocabularyLearningProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const searchParams = useSearchParams()
  const wordIds = searchParams.get('words')?.split(',') || []
  const [isFlipped, setIsFlipped] = useState(false)
  const router = useRouter()

  let wordCurrent = topic?.vocabularies?.find(word => word._id === wordIds[currentWordIndex])
  const progress = (currentWordIndex + 1) / wordIds.length * 100

  const handlePrevious = () => {
    if (currentWordIndex > 0) {
      setIsFlipped(false)
      setCurrentWordIndex(currentWordIndex - 1)
      wordCurrent = topic.vocabularies.find(word => word._id === wordIds[currentWordIndex - 1])
    }
  }

  const handleNext = () => {
    if (currentWordIndex < wordIds.length - 1) {
      setIsFlipped(false)
      setCurrentWordIndex(currentWordIndex + 1)
      wordCurrent = topic.vocabularies.find(word => word._id === wordIds[currentWordIndex + 1])
    } else {
      router.push(`/quizz/${topic._id}?type=vocabulary`)
    }
  }

  const handleFlip = (e: React.MouseEvent, word: string) => {
    e.stopPropagation()
    setIsFlipped(!isFlipped)
    playAudio(word)
  }

  return (
    <>
      <header
        className="flex items-center gap-2 text-primary cursor-pointer"
        onClick={() => router.back()}
      >
        <ArrowLeft /> Quay lại danh sách từ
      </header>

      <div className="max-w-5xl m-auto">
        <Card className="my-5">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Từ vựng</CardTitle>
            <CardDescription className="text-gray-500">Học {wordIds.length} từ đã chọn</CardDescription>
          </CardHeader>

          <CardContent>
            <Progress value={progress} className="bg-gray-200" />
            <div className="flex justify-between items-center text-gray-600">
              <span>Tiến độ: {progress.toFixed(0)}%</span>
              <span>Từ đã học: {currentWordIndex + 1}/{wordIds.length}</span>
            </div>
          </CardContent>
        </Card>

        {wordCurrent && <Flashcard
          key={wordCurrent._id}
          word={wordCurrent.word}
          url={wordCurrent.image.url}
          phonetic={wordCurrent.transcription}
          partOfSpeech={wordCurrent.partOfSpeech}
          vietnamese={wordCurrent.vietnameseMeaning}
          definition={wordCurrent.definition}
          example={wordCurrent.example}
          isFlipped={isFlipped}
          handleFlip={handleFlip}
        />}

        <div className="flex justify-between items-center gap-4 mt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentWordIndex === 0}
          >
            <ArrowLeft />Trước
          </Button>

          <div className="flex items-center gap-2">
            <Button onClick={(e) => handleFlip(e, wordCurrent?.word || '')} className="bg-secondary"><RotateCcw /> Lật thẻ</Button>
            <Button onClick={() => playAudio(wordCurrent?.word || '')} className="bg-secondary"><Volume2 /> Phát âm</Button>
          </div>

          <Button onClick={handleNext}>
            {currentWordIndex === wordIds.length - 1 ? 'Làm bài kiểm tra' : 'Tiếp'}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </>
  )
}

