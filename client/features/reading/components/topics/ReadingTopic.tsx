'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardReadingTopic from "./CardReadingTopic";
import { IReading } from "@/features/reading/types";
import { BookOpen } from "lucide-react";

interface ReadingTopicProps {
  readings: IReading[]
}

export function ReadingTopic({ readings }: ReadingTopicProps) {
  if (readings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-40" />
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-500 p-6 rounded-full text-white">
              <BookOpen className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có bài đọc</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Kho bài đọc đang được biên soạn thêm. Bạn hãy quay lại sau để tiếp tục luyện tập nhé!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <CardTitle className="p-2 bg-gradient-to-r from-sky-500 to-indigo-400 rounded-md text-white">
          📖
        </CardTitle>
        <CardDescription className="text-2xl font-semibold">Danh sách bài đọc</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {
          readings.map((topic) => (
            <CardReadingTopic key={topic._id} topic={topic} />
          ))
        }
      </CardContent>
    </Card>
  )
}

