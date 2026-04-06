"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardMusic } from "./CardMusic";
import type { EntertainmentItem } from '@/features/entertainment'
import { Music2 } from "lucide-react";

interface MusicsProps {
  items: EntertainmentItem[]
}

export function Musics({ items }: MusicsProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-pink-100 rounded-full blur-xl opacity-40" />
            <div className="relative bg-gradient-to-br from-pink-500 to-rose-500 p-6 rounded-full text-white">
              <Music2 className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có bài hát</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Kho giải trí âm nhạc đang được cập nhật thêm nội dung mới. Vui lòng quay lại sau nhé!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <CardTitle className="p-2 bg-gradient-to-r from-pink-500 to-pink-300 rounded-md text-white">
            🎵
          </CardTitle>
          <CardDescription className="text-2xl font-semibold flex-1">Danh sách bài hát</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
        {items.map((it) => {
          const thumb = typeof it.thumbnailUrl === 'string' ? it.thumbnailUrl : (it.thumbnailUrl?.url || '/placeholder.png')
          return (
            <CardMusic
              key={it._id}
              id={it._id}
              title={it.title}
              artist={it.author || '—'}
              duration={''}
              thumbnail={thumb}
              genre={[]}
              releaseYear={0}
              isLiked={!!it.userFlags?.liked}
              isPlaying={false}
              isNew={false}
              isTrending={false}
              isVipRequired={it.isVipRequired}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}
