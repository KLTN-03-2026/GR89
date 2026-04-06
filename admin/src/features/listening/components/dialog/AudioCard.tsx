'use client'
import { Card, CardContent } from '@/components/ui/card'
import { Media } from '@/features/Media/types'
import { Music2 } from 'lucide-react'

interface AudioCardProps {
  audio: Media
  isSelected: boolean
  onSelect: (audio: Media) => void
  onDeselect: (audio: Media) => void
}

export function AudioCard({ audio, isSelected, onSelect, onDeselect }: AudioCardProps) {
  const handleClick = () => {
    if (isSelected) {
      onDeselect(audio)
    } else {
      onSelect(audio)
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected
        ? 'ring-2 ring-blue-500 bg-blue-50'
        : 'hover:bg-gray-50'
        }`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Audio Icon */}
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded bg-blue-500 flex items-center justify-center text-white">
              <Music2 className="w-6 h-6" />
            </div>
          </div>

          {/* Audio Info */}
          <div className="text-center space-y-1">
            <h3 className="font-medium text-sm truncate" title={audio.publicId}>
              {audio.publicId || 'Untitled'}
            </h3>
            <p className="text-xs text-gray-500 truncate" title={audio.url}>
              {audio.url.split('/').pop() || 'No filename'}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>{audio.format?.toUpperCase() || 'AUDIO'}</span>
              {audio.size && (
                <span>{Math.round(audio.size / 1024)}KB</span>
              )}
            </div>
          </div>

          {/* Audio Player */}
          <div className="flex justify-center">
            <audio
              controls
              className="w-full h-8"
              preload="none"
            >
              <source src={audio.url} />
              Trình duyệt không hỗ trợ audio
            </audio>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
