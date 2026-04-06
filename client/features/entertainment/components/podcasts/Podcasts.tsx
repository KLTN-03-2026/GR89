"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CardPodcast from './CardPodcast'
import type { EntertainmentItem } from '@/features/entertainment'
import { Podcast } from "lucide-react";

interface PodcastsProps {
  items: EntertainmentItem[]
}

export function Podcasts({ items }: PodcastsProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-rose-100 rounded-full blur-xl opacity-40" />
            <div className="relative bg-gradient-to-br from-rose-500 to-pink-500 p-6 rounded-full text-white">
              <Podcast className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có podcast</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Nội dung podcast sẽ được cập nhật trong thời gian tới. Vui lòng quay lại sau nhé!
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
            🎧
          </CardTitle>
          <CardDescription className="text-2xl font-semibold flex-1">Danh sách podcast</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {items.map((it) => {
          const thumb = typeof it.thumbnailUrl === 'string' ? it.thumbnailUrl : (it.thumbnailUrl?.url || '')
          return (
            <CardPodcast
              key={it._id}
              id={it._id}
              title={it.title}
              description={it.description || ''}
              image={thumb}
              author={{ name: it.author || '—', avatar: '', verified: false }}
              isLiked={!!it.userFlags?.liked}
              isSaved={false}
              isNew={false}
              isTrending={false}
              isFeatured={false}
              likes={0}
              comments={0}
              views={0}
              downloads={0}
              createdAt={''}
              tags={[]}
              category={'Podcast'}
              isVipRequired={it.isVipRequired}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}
