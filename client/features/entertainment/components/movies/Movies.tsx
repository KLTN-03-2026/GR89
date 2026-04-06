"use client"
import CardMovie from './CardMovie'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { EntertainmentItem } from '@/features/entertainment'
import { Clapperboard } from "lucide-react";

interface MoviesProps {
  items: EntertainmentItem[]
}

export function Movies({ items }: MoviesProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-100 rounded-full blur-xl opacity-40" />
            <div className="relative bg-gradient-to-br from-purple-500 to-fuchsia-500 p-6 rounded-full text-white">
              <Clapperboard className="w-12 h-12" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có phim</h3>
          <p className="text-sm text-gray-500 text-center max-w-md">
            Kho giải trí phim ảnh đang được cập nhật thêm. Bạn hãy quay lại sau nhé!
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
            🎬
          </CardTitle>
          <CardDescription className="text-2xl font-semibold flex-1">Danh sách phim</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6">
        {items.map((it) => {
          const thumb = typeof it.thumbnailUrl === 'string' ? it.thumbnailUrl : (it.thumbnailUrl?.url || '/placeholder.png')
          return (
            <CardMovie
              key={it._id}
              id={it._id}
              title={it.title}
              description={it.description || ''}
              poster={thumb}
              duration={''}
              director={it.author || '—'}
              isFavorite={!!it.userFlags?.liked}
              isWatched={!!it.userFlags?.watched}
              isNew={false}
              isTrending={false}
              originalTitle={undefined}
              backdrop={undefined}
              year={0}
              rating={0}
              genre={[]}
              cast={[]}
              language={''}
              country={''}
              trailerUrl={undefined}
              imdbRating={undefined}
              rottenTomatoes={undefined}
              metacritic={undefined}
              isVipRequired={it.isVipRequired}
            />
          )
        })}
      </CardContent>
    </Card>
  )
}
