'use client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface Props {
  word: string
  url: string
  partOfSpeech: string
  phonetic: string
  vietnamese: string
  definition: string
  example: string
  isFlipped: boolean
  handleFlip: (e: React.MouseEvent, word: string) => void
}

export default function Flashcard({ word, url, phonetic, partOfSpeech, vietnamese, definition, example, isFlipped, handleFlip }: Props) {
  const phoneticFormatted = phonetic.replace(/(\/|\s)/g, '').trim()

  return (
    <div className="relative mb-8" style={{ perspective: '1000px' }}>
      <Card
        className={`w-full min-h-[540px] cursor-pointer transition-all duration-700 transform-gpu border-0 shadow-2xl hover:shadow-[0_20px_60px_rgba(79,70,229,0.2)] ${isFlipped ? 'rotate-y-180' : ''
          }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
        onClick={(e) => handleFlip(e, word)}
      >
        {/* Front */}
        <CardContent
          className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-primary text-white rounded-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full max-w-xl">
            <div className="relative rounded-2xl overflow-hidden ring-4 ring-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
              <Image
                src={url}
                width={100}
                height={100}
                alt={`Hình minh họa từ`}
                className="w-full h-[300px] object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
            </div>

            <div className="text-center mt-6">
              <div className="flex items-center justify-center mb-3">
                <h2 className="text-5xl font-extrabold mr-3 drop-shadow">{word}</h2>
              </div>
              <p className="text-xl mb-2 font-mono opacity-90">/{phoneticFormatted}/</p>
              <Badge variant="secondary" className="mb-2">
                {partOfSpeech}
              </Badge>
              <p className="text-white/85 text-lg">Nhấn để xem nghĩa & ví dụ</p>
            </div>
          </div>
        </CardContent>

        {/* Back */}
        <CardContent
          className="absolute inset-0 p-6 bg-white rounded-lg overflow-y-auto"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="h-full flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{word}</h3>
                <p className="text-gray-500 font-mono">{partOfSpeech}</p>
              </div>

              <div className="space-y-6">
                <div className="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm">
                  <h4 className="font-bold text-green-800 mb-2">Nghĩa tiếng Việt</h4>
                  <p className="text-2xl font-semibold text-green-700">{vietnamese}</p>
                </div>

                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
                  <h4 className="font-bold text-blue-800 mb-2">Định nghĩa tiếng Anh</h4>
                  <p className="text-gray-800 leading-relaxed">{definition}</p>
                </div>

                <div className="bg-purple-50 p-5 rounded-xl border border-purple-200 shadow-sm">
                  <h4 className="font-bold text-purple-800 mb-2">Ví dụ</h4>
                  <p className="text-gray-900 italic text-lg mb-2">&quot;{example}&quot;</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

