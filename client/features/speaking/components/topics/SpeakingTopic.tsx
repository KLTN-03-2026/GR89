'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardSpeakingTopic from "./CardSpeakingTopic";
import { Mic } from "lucide-react";
import { Speaking } from "@/features/speaking/types";

interface SpeakingTopicProps {
  speakings: Speaking[]
}

export function SpeakingTopic({ speakings }: SpeakingTopicProps) {
  if (speakings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50" />
            <div className="relative bg-gradient-to-br from-orange-500 to-amber-400 p-6 rounded-full text-white">
              <Mic className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có bài nói</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Chúng tôi sẽ bổ sung thêm bài luyện nói trong thời gian sớm nhất.
          </p>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <CardTitle className="p-2 bg-gradient-to-r from-orange-500 to-amber-300 rounded-md text-white">
          🗣️
        </CardTitle>
        <CardDescription className="text-2xl font-semibold">Danh sách bài nói</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {speakings.map((speaking) => (
          <CardSpeakingTopic key={speaking._id} topic={speaking} />
        ))}
      </CardContent>
    </Card>
  )
}

