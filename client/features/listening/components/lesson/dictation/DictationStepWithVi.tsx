'use client'

import { useState } from 'react'
import { AudioSection } from '@/components/common/medias'
import { useRouter } from 'next/navigation'
import DictationHasStarted from './DictationHasStarted'
import DictationInput from './DictationInput'
import { Eye, EyeOff, RefreshCcw, CheckCircle } from 'lucide-react'
import { diffWords } from 'diff'

interface DictationStepWithViProps {
  listeningId: string
  audioUrl: string
  subtitleEn: string
  subtitleVi: string
  title: string
  formDataDictationResult: {
    value: string
    added?: boolean
    removed?: boolean
  }[]
  setFormDataDictationResult: (formDataDictationResult: {
    value: string
    added?: boolean
    removed?: boolean
  }[]) => void
  handleSubmit: () => void
  onRetry?: () => void
}

const sanitizeSubtitleForDictation = (text: string) =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => Boolean(line))
    .map((line) => line.replace(/^[AB]\s*:\s*/i, ''))
    .join('\n')

export function DictationStepWithVi({
  listeningId,
  audioUrl,
  subtitleEn,
  subtitleVi,
  formDataDictationResult,
  setFormDataDictationResult,
  handleSubmit,
  onRetry
}: DictationStepWithViProps) {
  const router = useRouter()
  const normalizedSubtitleEn = sanitizeSubtitleForDictation(subtitleEn)

  const [inputText, setInputText] = useState('')

  const [hasStarted, setHasStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showSubtitleVi, setShowSubtitleVi] = useState(false)
  const [diffResult, setDiffResult] = useState<any[]>([])

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tua lùi 5s audio
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: -5 } }))
      return
    }

    // Tua tới 5s audio
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: 5 } }))
      return
    }

    // Click Control toggle audio
    if (e.key === 'Control') {
      e.preventDefault()
      window.dispatchEvent(new Event('audio:toggle'))
      return
    }
  }

  // Handle submit dictation full text
  const handleSubmitDictation = async () => {
    const cleanCorrect = normalizedSubtitleEn.replace(/[.,?!;:"'()\-’‘´”“…]/g, '').replace(/[ \t]+/g, ' ').trim()
    const cleanUser = inputText.replace(/[.,?!;:"'()\-’‘´”“…]/g, '').replace(/[ \t]+/g, ' ').trim()

    // Đổi vị trí cleanUser và cleanCorrect để diffWords giữ lại định dạng xuống dòng (\n) từ cleanCorrect
    const differences = diffWords(cleanUser, cleanCorrect, { ignoreCase: true })

    const formattedDiff = differences.map(part => ({
      value: part.value,
      ...(part.removed && { added: true }),
      ...(part.added && { removed: true })
    }))

    setDiffResult(formattedDiff)
    setFormDataDictationResult(formattedDiff)
    setIsCompleted(true)
  }

  // Tính điểm và tỷ lệ đúng
  const correctCount = formDataDictationResult.reduce((acc, part) => {
    if (!part?.added && !part?.removed) {
      return acc + (part?.value || '').trim().split(/[ \t\n]+/).filter(Boolean).length;
    }
    return acc;
  }, 0);

  const totalWords = formDataDictationResult.reduce((acc, part) => {
    if (!part?.added) {
      return acc + (part?.value || '').trim().split(/[ \t\n]+/).filter(Boolean).length;
    }
    return acc;
  }, 0);

  const pct = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0

  // Handle go to result page
  const handleGoToResultPage = async () => {
    handleSubmit()
  }

  // Handle retry
  const handleRetry = () => {
    if (!onRetry) {
      router.replace(`/skills/listening/${listeningId}`)
    }
    else {
      setInputText('')
      setFormDataDictationResult([])
      setHasStarted(false)
      setIsCompleted(false)
      setShowSubtitleVi(false)
      onRetry()
    }
  }

  // Format the diff result into lines for rendering
  const diffLines: { value: string, added?: boolean, removed?: boolean }[][] = [];
  let currentLineParts: { value: string, added?: boolean, removed?: boolean }[] = [];

  diffResult.forEach(part => {
    const value = part?.value || '';
    const subParts = value.split('\n');
    subParts.forEach((subPart: string, index: number) => {
      if (index > 0) {
        diffLines.push(currentLineParts);
        currentLineParts = [];
      }
      if (subPart) {
        currentLineParts.push({ ...part, value: subPart });
      }
    });
  });
  if (currentLineParts.length > 0 || diffLines.length === 0) {
    diffLines.push(currentLineParts);
  }

  const linesVi = subtitleVi.split('\n').map(line => line.trim()).filter(Boolean);

  // Extract speaker names from the original subtitleEn
  const originalLines = String(subtitleEn || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const speakerNames = originalLines.map(line => {
    const match = line.match(/^([A-Za-z0-9\s]+)\s*:/i);
    return match ? match[1] : null;
  });

  return (
    <div className="space-y-6">

      <AudioSection audioUrl={audioUrl} />

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-6 space-y-5">
          {!hasStarted ? (
            <DictationHasStarted handleStart={() => setHasStarted(true)} />
          ) : (
            <div className="space-y-4">
              <DictationInput
                inputText={inputText}
                setInputText={setInputText}
                handleKeyDown={handleKeyDown}
                isCompleted={isCompleted}
              />

              {!isCompleted && (
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitDictation}
                    disabled={!inputText.trim()}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Nộp bài chấm điểm
                  </button>
                </div>
              )}
            </div>
          )}

          {hasStarted && isCompleted && (
            <div className="space-y-6">
              {/* Diff Result Line by Line */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-700">Đoạn hội thoại đã chấm điểm</h3>
                  <button
                    onClick={() => setShowSubtitleVi(!showSubtitleVi)}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                  >
                    {showSubtitleVi ? (
                      <><EyeOff className="w-4 h-4" /> Ẩn tiếng Việt</>
                    ) : (
                      <><Eye className="w-4 h-4" /> Xem tiếng Việt</>
                    )}
                  </button>
                </div>
                <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
                  {diffLines.map((lineParts, index) => {
                    if (lineParts.length === 0 && !linesVi[index]) return null;
                    const speaker = speakerNames[index];
                    return (
                      <div key={index} className="space-y-0.5">
                        <div className="text-gray-800 leading-relaxed text-base flex items-start">
                          {speaker && (
                            <span className="font-bold text-indigo-700 mr-2 flex-shrink-0">{speaker}:</span>
                          )}
                          <div className="flex-1">
                            {lineParts.map((part, i) => {
                              if (part.added) {
                                return (
                                  <span key={i} className="bg-red-100 text-red-700 line-through mx-0.5 px-1 py-0.5 rounded-md">
                                    {part.value}
                                  </span>
                                );
                              }
                              if (part.removed) {
                                return (
                                  <span key={i} className="bg-amber-100 text-amber-800 mx-0.5 px-1 py-0.5 rounded-md" title="Từ này bạn gõ thiếu hoặc sai">
                                    {part.value}
                                  </span>
                                );
                              }
                              return (
                                <span key={i} className="text-gray-800">
                                  {part.value}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        {showSubtitleVi && linesVi[index] && (
                          <p className={`text-gray-500 text-sm leading-snug mt-0.5 ${speaker ? 'ml-8' : ''}`}>{linesVi[index]}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Điểm:</span>
                  <span className="font-bold text-indigo-600 tabular-nums">{correctCount}/{totalWords}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Tỷ lệ chính xác:</span>
                  <span className={`font-bold tabular-nums ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'
                    }`}>
                    {pct}%
                  </span>
                </div>
                <div className="flex-1 h-2 max-w-[150px] rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Các nút hành động */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Làm lại
                </button>
                <button
                  onClick={handleGoToResultPage}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

