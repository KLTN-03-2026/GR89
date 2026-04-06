'use client'

import { IReading } from "@/features/reading/types"
import { LessonHeader } from "./LessonHeader"
import { PassageSection } from "./PassageSection"
import QuizPanel from "../exam/QuizPanel"
import { IQuizResultData } from "@/features/quizz/types"
import { useState } from "react"
import { toast } from "react-toastify"
import { doReadingQuiz } from "@/features/quizz/services/quizzApi"
import { useRouter } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, HelpCircle } from "lucide-react"

interface ReadingLessonClientProps {
  reading: IReading
}

export function ReadingLessonClient({ reading }: ReadingLessonClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("passage")
  const router = useRouter()

  const handleSubmitQuiz = async (results: IQuizResultData[]) => {
    setIsSubmitting(true)
    try {
      const response = await doReadingQuiz(reading._id, results)
      if (response.success) {
        toast.success("Nộp bài thành công!")
        // Chuyển hướng sang trang kết quả sau khi nộp bài
        router.push(`/skills/reading/result/${reading._id}`)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Nộp bài thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <LessonHeader
        title={reading.title}
        level={reading.level}
        backUrl="/skills/reading"
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Desktop View: Side by side */}
        <div className="hidden md:flex flex-1 flex-row h-full max-w-[1800px] mx-auto w-full gap-4 p-4 overflow-hidden">
          {/* Left: Passage Section */}
          <section className="flex-1 min-h-0">
            <PassageSection
              title={reading.title}
              description={reading.description}
              content={reading.paragraphEn}
              vocabulary={reading.vocabulary}
              image={reading.image as any}
            />
          </section>

          {/* Right: Question Section */}
          <section className="w-full md:w-[450px] lg:w-[500px] shrink-0 min-h-0 flex flex-col">
            <QuizPanel
              quizzes={reading.quizzes as any}
              onSubmit={handleSubmitQuiz}
            />
          </section>
        </div>

        {/* Mobile View: Tabs */}
        <div className="flex md:hidden flex-1 flex-col h-full w-full overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-white border-b border-slate-200">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 h-10 rounded-lg">
                <TabsTrigger
                  value="passage"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Bài đọc</span>
                </TabsTrigger>
                <TabsTrigger
                  value="quiz"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Câu hỏi</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="passage" className="h-full m-0 p-0 overflow-hidden">
                <PassageSection
                  title={reading.title}
                  description={reading.description}
                  content={reading.paragraphEn}
                  vocabulary={reading.vocabulary}
                  image={reading.image as any}
                />
              </TabsContent>
              <TabsContent value="quiz" className="h-full m-0 p-0 overflow-hidden">
                <QuizPanel
                  quizzes={reading.quizzes as any}
                  onSubmit={handleSubmitQuiz}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
