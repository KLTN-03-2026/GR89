'use client'
import { getTime } from "@/libs/utils";
import { ArrowLeft, Brain, Clock, FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface props {
  question: number
  finished: () => void
  questionNumber: number
}

export function HeaderQuizzLayout({ question, finished, questionNumber }: props) {
  const router = useRouter()
  const [time, setTime] = useState<number>(question * 60)

  //tiếng đồ hồ kêu
  // const audio = new Audio('/sounds/tiengdongho.mp3')
  // audio.play()

  useEffect(() => {
    if (time === 0) {
      finished()
    }
    const interval = setInterval(() => {
      setTime(prev => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [time, finished])

  return (
    <header className="sticky top-0 z-50 w-full bg-white h-24 px-5 flex items-center justify-between">
      <div className="flex items-center justify-start gap-4 ">
        <div
          onClick={() => router.back()}
          className="flex items-center cursor-pointer text-lg gap-2 text-gray-500 px-4 border-r border-r-gray-400"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden md:block">Quay lại bài học</span>
        </div>

        <div className="flex items-center gap-4">
          <Brain className="w-10 h-10 text-purple-500" />

          <div>
            <h1 className="text-2xl font-bold">Bài kiểm tra</h1>
            <p className="text-sm text-gray-500">Personal Pronouns (Đại từ nhân xưng)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1"><Clock /> {getTime(time)}</span>
        <span className="flex items-center gap-1"><FileQuestion /> {questionNumber}/{question}</span>
      </div>
    </header>
  )
}
