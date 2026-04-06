import { Card, CardContent } from "@/components/ui/card"
import { Media } from "@/features/Media/types";
import { Check } from "lucide-react"
import Image from "next/image"

interface ImageCardProps {
  image: Media
  isSelected?: boolean
  onSelect?: (image: Media) => void
  onDeselect?: (image: Media) => void
}

export function ImageCard({ image, isSelected = false, onSelect, onDeselect }: ImageCardProps) {
  const formatFileSize = (bytes: number | undefined) => {
    if (bytes === undefined || bytes === null || isNaN(Number(bytes)) || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleClick = () => {
    if (isSelected && onDeselect) {
      onDeselect(image)
    } else if (!isSelected && onSelect) {
      onSelect(image)
    }
  }

  const displayFormat = image.format ? image.format.toUpperCase() : 'UNKNOWN'
  const displayDimensions = (image.width && image.height) 
    ? `${image.width} × ${image.height}` 
    : 'Kích thước ẩn'

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:scale-105'}`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-lg mb-3 bg-gray-100 flex items-center justify-center">
          <Image
            src={image.url}
            alt={`Image ${image._id}`}
            className="w-full h-full object-cover"
            width={image.width || 400}
            height={image.height || 400}
            loading="lazy"
          />

          {/* Selection indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-sm">
              <Check className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          {/* Format and size */}
          <div className="flex items-center justify-between text-[10px] text-gray-500 font-medium">
            <span className="uppercase">{displayFormat}</span>
            <span>{formatFileSize(image.size)}</span>
          </div>

          {/* Dimensions */}
          <div className="text-[10px] text-gray-400 text-center font-medium">
            {displayDimensions}
          </div>

          {/* Date */}
          <div className="text-[9px] text-gray-300 text-center">
            {image.createdAt ? new Date(image.createdAt).toLocaleDateString('vi-VN') : '1/4/2026'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}