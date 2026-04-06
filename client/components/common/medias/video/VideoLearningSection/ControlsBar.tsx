import React from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ControlsBarProps {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  onTogglePlay: () => void
  onToggleMute: () => void
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  isPlaying,
  isMuted,
  volume,
  onTogglePlay,
  onToggleMute,
  onVolumeChange
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="icon"
          onClick={onTogglePlay}
          className="bg-black/60 hover:bg-black/80 text-white border-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={onToggleMute}
          className="bg-black/60 hover:bg-black/80 text-white border-0"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </Button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={onVolumeChange}
          className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>
    </div>
  )
}


