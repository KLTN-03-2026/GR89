'use client'
import CardVocabularyTopic from "./CardVocabularyTopic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VocabularyTopics } from "../../types";
import { BookOpen, Layers } from "lucide-react";

interface VocabularyTopicProps {
  topics: VocabularyTopics[]
}

export function VocabularyTopic({ topics }: VocabularyTopicProps) {
  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-40" />
            <div className="relative bg-gradient-to-br from-emerald-400 to-teal-500 p-6 rounded-full text-white">
              <Layers className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có chủ đề từ vựng</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Hiện tại kho từ vựng đang được cập nhật. Bạn hãy quay lại sau nhé!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <CardTitle className="p-2 bg-yellow-400 rounded-md text-white"><BookOpen /></CardTitle>
        <CardDescription className="text-2xl font-semibold">Danh sách chủ đề từ vựng</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 items-stretch">
        {topics.map((topic: VocabularyTopics) => (
          <CardVocabularyTopic key={topic._id} topic={topic} />
        ))}
      </CardContent>
    </Card>
  )
}

