'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardWritingTopic from "./CardWritingTopic";
import { writingTopics } from "@/types";
import { PenSquare } from "lucide-react";

interface WritingTopicProps {
  topics: writingTopics[]
}

export function WritingTopic({ topics }: WritingTopicProps) {
  if (topics.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-teal-100 rounded-full blur-xl opacity-40" />
            <div className="relative bg-gradient-to-br from-teal-500 to-cyan-400 p-6 rounded-full text-white">
              <PenSquare className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có bài viết</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Nội dung luyện viết đang được cập nhật thêm. Vui lòng quay lại sau.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <CardTitle className="p-2 bg-gradient-to-r from-teal-500 to-cyan-300 rounded-md text-white">
          ✍️
        </CardTitle>
        <CardDescription className="text-2xl font-semibold">Danh sách bài viết</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {topics.map((topic) => (
          <CardWritingTopic key={topic._id} topic={topic} />
        ))}
      </CardContent>
    </Card>
  )
}

