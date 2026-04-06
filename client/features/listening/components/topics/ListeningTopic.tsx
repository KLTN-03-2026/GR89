'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardListeningTopic from "./CardListeningTopic";
import { IListening } from "@/features/listening/types";
import { Headphones } from "lucide-react";

interface ListeningTopicProps {
  listenings: IListening[]
}

export function ListeningTopic({ listenings }: ListeningTopicProps) {
  if (listenings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-pink-100 rounded-full blur-xl opacity-50" />
            <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 p-6 rounded-full text-white">
              <Headphones className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có bài nghe</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Nội dung nghe đang được cập nhật. Vui lòng quay lại sau ít phút nữa nhé!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-4">
        <CardTitle className="p-2 bg-gradient-to-r from-pink-500 to-pink-300 rounded-md text-white">
          🎧
        </CardTitle>
        <CardDescription className="text-2xl font-semibold">Danh sách bài nghe</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {listenings.map((topic) => (
          <CardListeningTopic key={topic._id} topic={topic} />
        ))}
      </CardContent>
    </Card>
  )
}

