'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Award, BookOpen, Sparkles, Star, Target, Trophy, Home, RotateCcw, ArrowLeft, FileText, Eye, EyeOff } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { resultWriting } from '../../types'

interface props {
  result: resultWriting
  onRetry?: () => void
}

export default function ResultCard({ result, onRetry }: props) {
  const { _id } = useParams()
  const router = useRouter()
  const [showRevised, setShowRevised] = useState(false)
  const total = (result?.rubricContent?.point || 0) + (result?.rubricStructure?.point || 0) + (result?.rubricGrammar?.point || 0) + (result?.rubricVocabulary?.point || 0)
  const grade = total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : 'D'
  const gradeColor = total >= 85 ? 'from-emerald-500 to-green-500' : total >= 70 ? 'from-blue-500 to-cyan-500' : total >= 55 ? 'from-yellow-500 to-orange-500' : 'from-red-500 to-pink-500'
  const gradeIcon = total >= 85 ? '🏆' : total >= 70 ? '🥈' : total >= 55 ? '🥉' : '📝'

  const handleGoHome = () => {
    router.replace('/dashboard')
  }

  const handleRetry = () => {
    if (!onRetry) {
      router.replace(`/skills/writing/lesson/${_id}`)
    }
    else {
      onRetry()
    }
  }

  const handleBackToWriting = () => {
    router.replace('/skills/writing')
  }

  return (
    <Card className="max-w-7xl mx-auto border-0 overflow-hidden relative">
      <CardHeader className='p-0 border-0 overflow-hidden relative'>
        <div className={`bg-gradient-to-r ${gradeColor} p-6 rounded-t-xl text-white relative z-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">{gradeIcon}</span>
                </div>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold mb-2">Kết quả chấm điểm</CardTitle>
                <p className="text-white/90 text-lg">Đánh giá chi tiết từ AI</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-2">{total}/100</div>
              <div className="text-2xl font-semibold text-white/90">{grade}</div>
              <div className="text-sm text-white/80 mt-1">Điểm tổng kết</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8 relative z-10">
        {/* Bài viết đã làm */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Bài viết của bạn</h3>
                <p className="text-white/80 text-sm">Nội dung bài viết đã nộp</p>
              </div>
            </div>
            {result.revisedContent && (
              <Button
                onClick={() => setShowRevised(!showRevised)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/30 text-white backdrop-blur-sm"
              >
                {showRevised ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ẩn bản đã sửa
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Xem bản đã sửa
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Bài viết gốc */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">Bài viết gốc</span>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base font-normal">
                    {result.content || 'Không có nội dung'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bài viết đã được AI sửa */}
            {result.revisedContent && showRevised && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-gray-700">Bản đã được AI sửa</span>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-2 border-emerald-200 shadow-sm">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base font-normal">
                      {result.revisedContent}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nội Dung */}
          <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 text-lg">Nội Dung</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{result?.rubricContent?.point || 0}</div>
                <div className="text-sm text-gray-500">/ 25</div>
              </div>
            </div>

            <Progress value={(result?.rubricContent?.point || 0) / 25 * 100} className="h-3 mb-4 bg-blue-100" />

            <p className="text-sm text-gray-600 mb-4 font-medium">Hiệu quả đạt {Math.round((result?.rubricContent?.point || 0) / 25 * 100)}%</p>

            <div className="space-y-3 h-48 overflow-y-auto">
              {result?.rubricContent?.feedback?.map((feedback: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-relaxed">{feedback}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ngữ Pháp */}
          <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 text-lg">Ngữ Pháp</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{result?.rubricGrammar?.point || 0}</div>
                <div className="text-sm text-gray-500">/ 25</div>
              </div>
            </div>

            <Progress value={(result?.rubricGrammar?.point || 0) / 25 * 100} className="h-3 mb-4 bg-green-100" />

            <p className="text-sm text-gray-600 mb-4 font-medium">Hiệu quả đạt {Math.round((result?.rubricGrammar?.point || 0) / 25 * 100)}%</p>

            <div className="space-y-3 h-48 overflow-y-auto">
              {result?.rubricGrammar?.feedback?.map((feedback: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-relaxed">{feedback}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cấu trúc */}
          <div className="group bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border border-purple-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 text-lg">Cấu trúc</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{result?.rubricStructure?.point || 0}</div>
                <div className="text-sm text-gray-500">/ 25</div>
              </div>
            </div>

            <Progress value={(result?.rubricStructure?.point || 0) / 25 * 100} className="h-3 mb-4 bg-purple-100" />

            <p className="text-sm text-gray-600 mb-4 font-medium">Hiệu quả đạt {Math.round((result?.rubricStructure?.point || 0) / 25 * 100)}%</p>

            <div className="space-y-3 h-48 overflow-y-auto">
              {result?.rubricStructure?.feedback?.map((feedback: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-relaxed">{feedback}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Từ Vựng */}
          <div className="group bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-gray-800 text-lg">Từ Vựng</h4>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-600">{result?.rubricVocabulary?.point || 0}</div>
                <div className="text-sm text-gray-500">/ 25</div>
              </div>
            </div>

            <Progress value={(result?.rubricVocabulary?.point || 0) / 25 * 100} className="h-3 mb-4 bg-orange-100" />

            <p className="text-sm text-gray-600 mb-4 font-medium">Hiệu quả đạt {Math.round((result?.rubricVocabulary?.point || 0) / 25 * 100)}%</p>

            <div className="space-y-3 h-48 overflow-y-auto">
              {result?.rubricVocabulary?.feedback?.map((feedback: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm leading-relaxed">{feedback}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nhận xét tổng quan */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-blue-800 text-lg">Nhận xét tổng quan</h4>
          </div>
          <p className="text-blue-700 leading-relaxed text-base">
            Bài viết đạt <span className="font-bold text-blue-800">{total}/100</span> với mức <span className="font-bold text-blue-800">{grade}</span>. {result.overallFeedback}.
          </p>
        </div>

        {/* Gợi ý cải thiện */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-orange-800 text-lg">Gợi ý cải thiện</h4>
          </div>
          <div className="space-y-3">
            {result.suggested.map((suggested: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition-colors duration-200">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-orange-700 leading-relaxed">{suggested}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handleGoHome}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Home className="w-5 h-5 mr-2" />
              Trang chủ
            </Button>

            <Button
              onClick={handleBackToWriting}
              variant="outline"
              className="px-8 py-3 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại Writing
            </Button>

            <Button
              onClick={handleRetry}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Làm lại
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Chúc mừng bạn đã hoàn thành bài viết! Hãy tiếp tục luyện tập để cải thiện kỹ năng.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

