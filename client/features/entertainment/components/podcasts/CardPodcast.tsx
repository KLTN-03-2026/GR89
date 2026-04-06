import {
  Play,
  Heart,
  Bookmark,
  Mic,
  MapPin,
  Sparkles,
  Star,
  Zap,
  Crown
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CardPodcastProps {
  id: string;
  title: string;
  description: string;
  image: string;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  location?: string;
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  downloads: number;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
  isNew: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  isVipRequired?: boolean;
  category: string;
}

export default function CardPodcast({
  id,
  title,
  description,
  image,
  author,
  location,

  createdAt,
  isLiked,
  isSaved,
  isNew,
  isTrending,
  isFeatured,
  isVipRequired,

}: CardPodcastProps) {
  return (
    <Link href={`/entertainment/podcasts/${id}`} className="group cursor-pointer">
      <div className="space-y-2">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-lg bg-gray-100 overflow-hidden">
          {image && image.trim() !== '' ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Mic className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-black/80 rounded-full p-2">
              <Play className="w-5 h-5 text-white fill-current" />
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
              <div className="bg-emerald-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                NEW
              </div>
            )}
            {isTrending && (
              <div className="bg-orange-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                <Zap className="w-3 h-3" />
                HOT
              </div>
            )}
            {isFeatured && (
              <div className="bg-purple-500 text-white text-xs px-1 py-0.5 rounded flex items-center gap-1">
                <Star className="w-3 h-3" />
                FEATURED
              </div>
            )}
          </div>

          {/* CreatedAt Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 py-0.5 rounded z-10">
            {createdAt}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
          )}

          {/* Author only row */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
              <Mic className="w-3 h-3" />
              Podcast
            </div>
            <div className="flex items-center gap-2">
              {location && (
                <div className="hidden sm:flex items-center gap-1 text-gray-400">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{location}</span>
                </div>
              )}
              <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {author.avatar && author.avatar.trim() !== '' ? (
                  <Image src={author.avatar} alt={author.name} width={20} height={20} className="object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 font-medium">
                    {author.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <span className="line-clamp-1">{author.name}</span>
              {isLiked && <Heart className="w-3 h-3 text-red-500 fill-current" />}
              {isSaved && <Bookmark className="w-3 h-3 text-blue-500 fill-current" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
