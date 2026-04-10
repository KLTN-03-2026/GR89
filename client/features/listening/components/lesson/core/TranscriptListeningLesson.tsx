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

  const normalizeWord = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,?!;:"'()\-]/g, '')
      .trim()

  const handleOnKeyDownInputText = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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

      if (currentIndex + 1 >= listText.length) {
        setIsCompleted(true)
        setShowComplete(true)
        setIsTimerActive(false)

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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Sẵn sàng bắt đầu?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Bạn sẽ nghe audio và gõ lại từng từ một cách tuần tự.
                </p>
                <Button onClick={handleStartLesson} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold text-lg">
                  Bắt đầu bài nghe
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">Gõ những gì bạn nghe được</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsShortcutsOpen(true)} className="shrink-0">
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
          )}

          {hasStarted && resultText.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-6 rounded-xl shadow-sm">
              <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                <div className="flex flex-wrap gap-2 leading-relaxed">
                  {resultText.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {!item.isCorrect ? (
                        <div className="px-2 py-1 rounded-md text-sm font-medium bg-red-100 flex items-center gap-2">
                          <span className="text-lg text-red-700 line-through">{item.text}</span>
                          <span className="text-lg font-medium">{listText[item.index]}</span>
                        </div>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded-md text-lg font-medium bg-green-100 border border-green-200">
                          {listText[item.index]}
                        </span>
                      )}
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isShortcutsOpen} onOpenChange={setIsShortcutsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phím tắt</DialogTitle>
            <DialogDescription>Các phím tắt giúp bạn làm bài nhanh hơn.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setIsShortcutsOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showComplete} onOpenChange={setShowComplete}>
        <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="rounded-xl bg-white/80 dark:bg-gray-900/40 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Điểm số</span>
                  <span className="font-semibold text-indigo-600">{correctCount}/{total}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" autoFocus={false} onClick={() => setShowComplete(false)} className="text-indigo-600">Ở lại</Button>
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

