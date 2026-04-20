'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { submitWriting } from '@/features/writing/services/writingApi'
import { Edit3, Loader2, RefreshCw, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStudySession } from '@/libs/hooks/useStudySession'
import { resultWriting } from '../../types'

interface props {
  minWords: number
  setResult: (result: resultWriting) => void
  _id: string
}

export default function WritingEditorCard({ minWords, setResult, _id }: props) {
  const [isLoading, setIsLoading] = useState(false)
  const [essay, setEssay] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const { startSession, getSessionPayload } = useStudySession()

  useEffect(() => {
    startSession()
  }, [_id, startSession])

  const canSubmit = wordCount >= minWords && essay.trim().length > 0

  // Reset bài viết
  const handleReset = () => {
    setEssay("")
    startSession()
  }

  // Tính số từ
  useEffect(() => {
    const words = essay.trim() ? essay.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [essay])

  const handleSubmit = () => {
    setIsLoading(true)
    const studySession = getSessionPayload()
    submitWriting(_id, { content: essay }, studySession)
      .then(async (res) => {
        setResult(res.data as unknown as resultWriting)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl">Viết bài luận</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Số từ</div>
              <div className={`font-semibold ${wordCount >= minWords ? 'text-green-600' : 'text-red-500'
                }`}>
                {wordCount}/{minWords}
              </div>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Progress
                value={Math.min((wordCount / minWords) * 100, 100)}
                className="w-12 h-12"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Bắt đầu viết bài luận của bạn ở đây..."
          className="min-h-[400px] text-lg leading-relaxed border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Làm lại
            </Button>
          </div>

          <Button
            disabled={!canSubmit || isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
          >
            {isLoading ?
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> :
              <Send className="w-4 h-4 mr-2" />
            }
            Nộp bài
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

