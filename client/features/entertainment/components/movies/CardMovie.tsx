import {
  Play,
  Heart,
  Eye,
  Film,
  Crown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CardMovieProps {
  id: string;
  title: string;
  originalTitle?: string;
  description: string;
  poster: string;
  backdrop?: string;
  year: number;
  duration: string;
  rating: number;
  genre: string[];
  director: string;
  cast: string[];
  language: string;
  country: string;
  isWatched: boolean;
  isFavorite: boolean;
  isNew: boolean;
  isTrending: boolean;
  isVipRequired?: boolean;
  trailerUrl?: string;
  imdbRating?: number;
  rottenTomatoes?: number;
  metacritic?: number;
  categoryLabel?: string;
}

export default function CardMovie({
  id,
  title,
  description,
  poster,

  duration,

  director,
  isWatched,
  isFavorite,
  isNew,
  isTrending,
  isVipRequired,
  categoryLabel,
}: CardMovieProps) {
  return (
    <Link href={`/entertainment/movies/${id}`} className="group cursor-pointer">
      <div className="space-y-2">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg bg-gray-100 overflow-hidden">
          {poster && poster.trim() !== '' ? (
            <Image
              src={poster}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Film className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/80 rounded-full p-2">
              <Play className="w-5 h-5 text-white fill-current" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded z-10">
            {duration}
          </div>

          {/* Status Indicators */}
          <div className="absolute top-2 left-2 flex gap-1 z-30">
            {isVipRequired && (
              <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-lg font-semibold border border-yellow-600">
                <Crown className="w-3.5 h-3.5 fill-white" />
                VIP
              </div>
            )}
            {isNew && (
              <div className="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                NEW
              </div>
            )}
            {isTrending && (
              <div className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded">
                HOT
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          )}

          {/* Author only row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              <Film className="w-3 h-3" />
              {categoryLabel || "Movie"}
            </div>
            <div className="flex items-center gap-2">
              <span className="line-clamp-1">{director}</span>
              {isFavorite && <Heart className="w-3 h-3 text-red-500 fill-current" />}
              {isWatched && <Eye className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
