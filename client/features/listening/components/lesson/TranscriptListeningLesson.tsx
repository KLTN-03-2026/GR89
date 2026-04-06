'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import CompactTimer from "./CompactTimer"
import { doListeningQuiz } from '@/features/listening/services/listeningApi'
import { notifyStreakIncrease } from "@/libs/streakToast"
import { toast } from "react-toastify"
import { useStudySession } from "@/libs/hooks/useStudySession"
import { Keyboard } from "lucide-react"

interface props {
  subtitle: string
  exitHref?: string
  _id: string
}

export default function TranscriptListeningLesson({ subtitle, exitHref = "/skills/listening", _id }: props) {
  const text = subtitle

  const listText = text.trim().split(" ")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [inputText, setInputText] = useState("")
  const [resultText, setResultText] = useState<{
    index: number,
    text: string,
    isCorrect: boolean
  }[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const { startSession, getSessionPayload } = useStudySession()

  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [resultText])

  const handleOnChangeInputText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
  }

  // Helper: normalize word to compare (case-insensitive, ignore accents & punctuation)
  const normalizeWord = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD') // tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
      .replace(/[.,?!;:"'()\-]/g, '') // bỏ dấu câu phổ biến
      .trim()

  //Hàm enter hoặc space để thêm kết quả
  const handleOnKeyDownInputText = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Audio shortcuts should work even while typing
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: -5 } }))
      return
    }
    if (e.key === "ArrowRight") {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('audio:seek', { detail: { delta: 5 } }))
      return
    }
    if (e.key === "Control") {
      e.preventDefault()
      window.dispatchEvent(new Event('audio:toggle'))
      return
    }

    if (e.key === "Enter" || e.key === " ") {
      // Prevent inserting space / submitting form accidentally
      e.preventDefault()
      const rawTarget = listText[currentIndex] || ''
      const isCorrect = normalizeWord(inputText) === normalizeWord(rawTarget)

      const newResultItem = {
        index: currentIndex,
        text: inputText,
        isCorrect: isCorrect
      }

      const newResultText = [...resultText, newResultItem]

      setResultText(newResultText)
      setInputText("")
      setCurrentIndex(currentIndex + 1)

      //Trường hợp hoàn thành bài học
      if (currentIndex + 1 >= listText.length) {
        setIsCompleted(true)
        setShowComplete(true)
        setIsTimerActive(false)

        //Gọi api doListeningQuiz để lưu điểm - sử dụng newResultText thay vì resultText
        const studySession = getSessionPayload()
        await doListeningQuiz(_id, duration, newResultText, studySession)
          .then(async () => {
            toast.success('Chúc mừng bạn đã hoàn thành bài nghe')
            await notifyStreakIncrease()
          })
      }
    }
  }

  const handleStartLesson = () => {
    setHasStarted(true)
    setIsTimerActive(true)
    startSession()
  }

  const correctCount = resultText.filter(item => item.isCorrect).length
  const total = resultText.length

  const handleRetry = () => {
    setCurrentIndex(0)
    setInputText("")
    setResultText([])
    setIsCompleted(false)
    setIsTimerActive(false)
    setDuration(0)
    setHasStarted(false)
    startSession()
  }

  return (
    <>
      {/* Compact Timer ở góc màn hình */}
      <CompactTimer
        isActive={isTimerActive}
        onTimeUpdate={setDuration}
        duration={duration}
      />

      <Card className="w-full">
        <CardContent className='space-y-4'>
          {!hasStarted ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Sẵn sàng bắt đầu?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Bạn sẽ nghe audio và gõ lại từng từ một cách tuần tự.<br />
                  Nhấn <strong>Next</strong> hoặc <strong>Enter</strong> để chuyển sang từ tiếp theo.<br />
                  Thời gian sẽ được tính từ khi bạn bắt đầu.
                </p>
                <Button
                  onClick={handleStartLesson}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Bắt đầu bài nghe
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-lg">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    Gõ những gì bạn nghe được (nhấn <b>Enter</b> hoặc <b>Space</b> để xác nhận từng từ)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsShortcutsOpen(true)}
                    className="shrink-0"
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    Phím tắt
                  </Button>
                </div>
                <Input
                  placeholder="Gõ những gì bạn nghe được"
                  value={inputText}
                  onChange={e => handleOnChangeInputText(e)}
                  onKeyDown={e => handleOnKeyDownInputText(e)}
                  onPaste={(e) => e.preventDefault()}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-white/80 backdrop-blur-sm border-gray-300 shadow-sm mt-2 focus:border-2"
                  disabled={isCompleted}
                />
              </div>
            </>
          )}

          {hasStarted && resultText.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Tiến độ của bạn</h3>
              </div>

              {/* Word-by-word display with corrections */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2 leading-relaxed">
                  {resultText.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {/* Correction for incorrect words */}
                      {!item.isCorrect ?
                        <div className="px-2 py-1 rounded-md text-sm font-medium bg-red-100 flex items-center gap-2">
                          <span className="text-lg text-red-700 line-through">
                            {item.text}
                          </span>
                          <span className="text-lg font-medium">
                            {listText[item.index]}
                          </span>
                        </div>
                        :
                        <span className="inline-block px-2 py-1 rounded-md text-lg font-medium bg-green-100 border border-green-200">
                          {listText[item.index]}
                        </span>
                      }
                    </div>
                  ))}

                  <div ref={endRef} />
                </div>
              </div>

              {/* Progress summary + CTA */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                  <div className="flex items-center gap-6">
                    <span className="text-gray-600">
                      Điểm số: <span className="font-semibold text-blue-600">{correctCount}/{total}</span>
                    </span>
                    <span className="text-gray-600">
                      Tỷ lệ đúng: <span className="font-semibold text-blue-600">{total ? Math.round((correctCount / total) * 100) : 0}%</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleRetry}>Ôn lại</Button>
                    <Button onClick={() => setShowDetails(v => !v)}>
                      {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </Button>
                  </div>
                </div>
              </div>

              {showDetails && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-white p-4">
                  <h4 className="font-semibold mb-3">Chi tiết các câu sai</h4>
                  {resultText.filter(it => !it.isCorrect).length === 0 ? (
                    <p className="text-sm text-gray-600">Bạn không có câu sai nào. Tuyệt vời!</p>
                  ) : (
                    <div className="space-y-2">
                      {resultText.filter(it => !it.isCorrect).map((it, i) => (
                        <div key={i} className="text-sm flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 line-through">{it.text}</span>
                          <span className="text-gray-500">→</span>
                          <span className="px-2 py-0.5 rounded bg-green-50 text-green-700">{listText[it.index]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shortcuts dialog */}
      <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phím tắt</DialogTitle>
            <DialogDescription>
              Các phím tắt giúp bạn làm bài nhanh hơn.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">Enter / Space</span>
              <span className="text-gray-600 dark:text-gray-300">Xác nhận từ (nhập đáp án)</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">←</span>
              <span className="text-gray-600 dark:text-gray-300">Lùi 5 giây</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">→</span>
              <span className="text-gray-600 dark:text-gray-300">Tua 5 giây</span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">Ctrl</span>
              <span className="text-gray-600 dark:text-gray-300">Phát / tạm dừng</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setIsShortcutsOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog hoàn thành */}
      <Dialog open={showComplete} onOpenChange={setShowComplete}>
        <DialogContent
          className="max-w-2xl w-[95vw] p-0 overflow-hidden"
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          {/* Top banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-6 py-5">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                Chúc mừng! Bạn đã hoàn thành bài nghe
              </DialogTitle>
              <DialogDescription className="text-indigo-100 mt-1">Tổng kết kết quả của bạn</DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-xl bg-white/80 dark:bg-gray-900/40 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Điểm số</span>
                  <span className="font-semibold text-indigo-600">{correctCount}/{total}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Tỷ lệ đúng</span>
                  <span className="font-semibold text-indigo-600">{total ? Math.round((correctCount / total) * 100) : 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Thời gian</span>
                  <span className="font-semibold text-indigo-600">
                    {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-white/80 dark:bg-gray-900/40 p-4 shadow-sm">
                <h4 className="font-semibold mb-2">Gợi ý tiếp theo</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Ôn lại các từ sai trong phần Chi tiết</li>
                  <li>Nghe lại audio ở tốc độ 1.25×</li>
                  <li>Tóm tắt nội dung bằng 2–3 câu</li>
                </ul>
              </div>
            </div>
            {/* Progress donut */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <svg viewBox="0 0 36 36" className="w-40 h-40">
                  <path className="text-gray-200" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2a16 16 0 110 32 16 16 0 010-32z" />
                  <path className="text-indigo-600" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"
                    strokeDasharray={`${Math.max(0, Math.min(100, total ? Math.round((correctCount / total) * 100) : 0))}, 100`}
                    d="M18 2a16 16 0 110 32 16 16 0 010-32z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-700">{total ? Math.round((correctCount / total) * 100) : 0}%</div>
                    <div className="text-xs text-gray-500">Tỷ lệ đúng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              variant="outline"
              autoFocus={false}
              onClick={() => setShowComplete(false)}
              className="text-indigo-600"
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation(); // không cho bubble xuống button
                }
              }}
            >
              Ở lại
            </Button>

            <Button onClick={() => { setShowComplete(false); handleRetry(); }}>Làm lại</Button>
            <Link href={exitHref} className="inline-flex">
              <Button variant="default">Về danh sách</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

