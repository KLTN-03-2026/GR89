'use client'
import { Volume2 } from 'lucide-react'
import { playAudio } from '@/libs/utils'
import { subtitle } from '../../types'

interface SentenceCardProps {
  subtitle: subtitle | null
  currentIndex: number
}

export function SentenceCard({ subtitle, currentIndex }: SentenceCardProps) {
  const handlePlayAudio = () => {
    if (subtitle?.english) {
      playAudio(subtitle.english)
    }
  }
  if (!subtitle) return null

  return (
    <div className="px-6 pb-4">
      <div className='p-4 rounded-lg transition-all bg-green-50 border-2 border-green-200'>
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <span className='text-lg font-bold text-green-600'>
              {currentIndex + 1}
            </span>
            <p className='font-medium text-lg text-green-700'>
              {subtitle.english}
            </p>
            <button
              onClick={handlePlayAudio}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Nghe phát âm mẫu"
            >
              <Volume2 className="w-5 h-5 text-blue-600" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-2">{subtitle?.phonetic || ''}</p>
          <p className="text-sm text-blue-600">{subtitle.vietnamese}</p>
        </div>
      </div>
    </div>
  )
}

