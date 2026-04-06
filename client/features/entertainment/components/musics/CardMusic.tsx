import {
  Play,
  Heart,
  Music,
  Headphones,
  Crown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CardMusicProps {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  thumbnail: string;
  genre: string[];
  releaseYear: number;
  isLiked: boolean;
  isPlaying: boolean;
  isNew: boolean;
  isTrending: boolean;
  isVipRequired?: boolean;
  views?: number;
  explicit?: boolean;
  featured?: string[];
}

export function CardMusic({
  id,
  title,
  artist,
  album,
  duration,
  thumbnail,
  genre,

  isLiked,
  isPlaying,
  isNew,
  isTrending,
  explicit,
  isVipRequired,
}: CardMusicProps) {
  return (
    <Link href={`/entertainment/musics/${id}`} className="group cursor-pointer">
      <div className="space-y-2">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg bg-gray-100 overflow-hidden">
          {thumbnail && thumbnail.trim() !== '' ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Music className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/80 rounded-full p-3">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex gap-1 z-30">
            {isVipRequired && (
              <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-lg font-semibold border border-yellow-600">
                <Crown className="w-3.5 h-3.5 fill-white" />
                VIP
              </div>
            )}
            {isNew && (
              <div className="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                NEW
              </div>
            )}
            {isTrending && (
              <div className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                HOT
              </div>
            )}
            {explicit && (
              <div className="bg-gray-800 text-white text-xs px-1 py-0.5 rounded">
                E
              </div>
            )}
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
            {duration}
          </div>

          {/* Playing Indicator */}
          {isPlaying && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 line-clamp-2">
            {artist}
            {album ? ` • ${album}` : genre.length > 0 ? ` • ${genre[0]}` : ''}
          </p>

          {/* Author only row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              <Music className="w-3 h-3" />
              Music
            </div>
            <div className="flex items-center gap-1">
              <Headphones className="w-3 h-3 text-gray-400" />
              <span className="line-clamp-1">{artist}</span>
              {isLiked && <Heart className="w-3 h-3 text-red-500 fill-current" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
