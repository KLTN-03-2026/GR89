'use client'
import React, { useState } from "react"
import CheckboxVocabulary from "./CheckboxVocabulary"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Layers, X } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { VocabularyTopics } from "@/types/vocabulary"
import { ContentStateDisplay } from "@/components/common/ContentStateDisplay"

interface ListVocabularyLessonProps {
  topic: VocabularyTopics
}

export function ListVocabularyLesson({ topic }: ListVocabularyLessonProps) {
  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const router = useRouter()

  const handleSelect = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word))
    } else {
      setSelectedWords([...selectedWords, word])
    }
  }
// code mới hgh
  const handleSelectAll = () => {
    setSelectedWords(topic.vocabularies.map((word) => word._id))
  }

  const handleUnselectAll = () => {
    setSelectedWords([])
  }

  const handleStart = () => {
    const wordIds = selectedWords.join(',')
    router.push(`/study/vocabulary/learn/${topic._id}?words=${wordIds}`)
  }

  if (!topic || !topic.vocabularies || topic.vocabularies.length === 0) {
    return (
      <ContentStateDisplay
        type="empty"
        message="Không có từ vựng nào trong bài học này"
        backUrl="/study/vocabulary"
        showBackButton={true}
        variant="fullscreen"
      />
    )
  }

  return (
    <Card className="pt-0 overflow-hidden">
      <CardHeader className="relative h-52 md:h-64 overflow-hidden">
        <div
          className="flex items-center gap-2 text-gray-500 cursor-pointer mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft />
          <span className="text-md">Trở về danh sách từ vựng</span>
        </div>

        <Image
          src={topic.image.url}
          alt={topic.name}
          fill
          className="object-cover"
          quality={90}
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <h1 className="absolute bottom-4 left-4 right-4 text-2xl md:text-3xl font-bold text-white">{topic.name}</h1>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-4">
          <p className="text-sm text-gray-500">{topic.vocabularies.length} từ vựng • {selectedWords.length} đã chọn</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleUnselectAll}><X /> Bỏ chọn tất cả</Button>
            <Button variant="outline" onClick={handleSelectAll}><Layers /> Chọn tất cả</Button>
            <Button
              disabled={selectedWords.length === 0}
              className="text-white"
              onClick={handleStart}
            >
              Bắt đầu <ArrowRight />
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-4 mt-4'>
          {
            topic.vocabularies.map((word) => (
              <CheckboxVocabulary
                key={word._id}
                url={word.image.url}
                word={word.word}
                phonetic={word.transcription}
                vietnamese={word.vietnameseMeaning}
                handleSelect={() => handleSelect(word._id)}
                checked={selectedWords.includes(word._id)}
              />
            ))
          }
        </div>
      </CardContent>
    </Card >
  )
}

