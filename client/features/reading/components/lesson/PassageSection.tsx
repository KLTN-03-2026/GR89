'use client'

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Volume2, X, Loader2, Info } from "lucide-react"
import { playAudio } from "@/libs/utils"
import { translateWordToVi, fetchWordDetails, DictionaryDetails } from "@/libs/utils/translate"
import Image from "next/image"
import { IVocabularyReading } from "@/features/reading/types"
import { Button } from "@/components/ui/button"

interface PassageSectionProps {
  title: string
  description: string
  content: string
  vocabulary: IVocabularyReading[]
  image?: {
    url: string
    width?: number
    height?: number
  }
}

export function PassageSection({ title, description, content, vocabulary, image }: PassageSectionProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [meaningCache, setMeaningCache] = useState<Record<string, string>>({})
  const [detailsCache, setDetailsCache] = useState<Record<string, DictionaryDetails>>({})
  const [isLoadingMeaning, setIsLoadingMeaning] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { setIsMounted(true) }, [])

  const handleClickWord = async (rawWord: string) => {
    const word = rawWord.replace(/[^a-zA-Z']/g, '').toLowerCase()
    if (!word) return
    setSelectedWord(word)

    if (!meaningCache[word] || !detailsCache[word]) {
      try {
        setIsLoadingMeaning(true)
        const [vi, details] = await Promise.all([
          meaningCache[word] ? Promise.resolve(meaningCache[word]) : translateWordToVi(word),
          detailsCache[word] ? Promise.resolve(detailsCache[word]) : fetchWordDetails(word)
        ])
        if (vi) setMeaningCache(prev => ({ ...prev, [word]: vi }))
        if (details) setDetailsCache(prev => ({ ...prev, [word]: details }))
      } catch {
      } finally {
        setIsLoadingMeaning(false)
      }
    }
  }

  const renderParagraphTokens = (text: string) => {
    const tokens = text.match(/([A-Za-z']+|[^A-Za-z']+)/g) || [text]
    const vocabSet = new Set((vocabulary || []).map(v => v.word.toLowerCase()))

    return tokens.map((tok, i) => {
      const isWord = /^[A-Za-z']+$/.test(tok)
      if (!isWord) return <span key={i}>{tok}</span>
      const lower = tok.toLowerCase()
      const isVocab = vocabSet.has(lower)

      return (
        <span
          key={i}
          className={isVocab
            ? "font-bold text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors underline decoration-blue-300 decoration-2 underline-offset-4"
            : "cursor-pointer hover:bg-slate-100 transition-colors"
          }
          onClick={() => handleClickWord(tok)}
          data-word-token
        >
          {tok}
        </span>
      )
    })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" ref={contentRef}>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
        {image?.url && (
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="relative group overflow-hidden rounded-2xl shadow-lg border border-slate-100 max-w-2xl w-full h-[30vh] sm:h-[40vh]">
              <Image
                src={image.url}
                alt={title}
                width={image.width || 800}
                height={image.height || 450}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>
        )}

        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">{title}</h2>
          <div className="w-20 h-1.5 bg-blue-500 mx-auto rounded-full mb-6" />
          <p className="text-slate-500 italic text-lg font-medium leading-relaxed">&quot;{description}&quot;</p>
        </div>

        <div className="text-xl leading-[2] text-slate-800 text-justify font-serif max-w-3xl mx-auto">
          {renderParagraphTokens(content)}
        </div>

        <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Mẹo: Bạn có thể nhấn vào bất kỳ từ nào trong đoạn văn trên để xem nghĩa tiếng Việt, cách phát âm và định nghĩa chi tiết. Những từ được <span className="font-bold text-blue-700 underline decoration-blue-300 decoration-2 underline-offset-4">gạch chân</span> là từ vựng quan trọng của bài học.
          </p>
        </div>
      </div>

      {/* Translation Tooltip Portal */}
      {isMounted && selectedWord && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[10000] flex items-center justify-center p-4" data-word-tooltip>
          <div className="absolute inset-0 w-full h-full bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedWord(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border-none bg-white p-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 p-4 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-black capitalize tracking-tight">{selectedWord}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {detailsCache[selectedWord]?.phonetic && (
                      <div className="text-blue-100 font-mono text-sm">{detailsCache[selectedWord]?.phonetic}</div>
                    )}
                    <button
                      className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      onClick={() => playAudio(selectedWord)}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  className="rounded-full p-1 text-white/70 hover:bg-white/20 transition-colors"
                  onClick={() => setSelectedWord(null)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="mb-6">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-4 h-px bg-slate-200" /> Nghĩa tiếng Việt
                </div>
                <div className="text-lg font-bold text-slate-800">
                  {isLoadingMeaning && !meaningCache[selectedWord] && !detailsCache[selectedWord]?.translationVi ? (
                    <div className="flex items-center gap-2 text-slate-400 py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Đang tìm kiếm...</span>
                    </div>
                  ) : (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      {meaningCache[selectedWord] || detailsCache[selectedWord]?.translationVi || 'Không tìm thấy nghĩa'}
                    </span>
                  )}
                </div>
              </div>

              {detailsCache[selectedWord]?.meanings && detailsCache[selectedWord].meanings.length > 0 && (
                <div className="space-y-4">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-200" /> Định nghĩa tiếng Anh
                  </div>
                  <div className="space-y-3">
                    {detailsCache[selectedWord]?.meanings?.slice(0, 3).map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        {m.partOfSpeech && (
                          <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase mb-1.5">
                            {m.partOfSpeech}
                          </span>
                        )}
                        <div className="text-sm text-slate-700 leading-relaxed font-medium">
                          {m.definitions[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
                onClick={() => setSelectedWord(null)}
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        </div>, document.body)
      }
    </div>
  )
}
