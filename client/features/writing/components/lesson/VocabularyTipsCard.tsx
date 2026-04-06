import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BookOpen, Sparkles } from 'lucide-react'

interface props {
  vocabularys: string[]
}

export default function VocabularyTipsCard({ vocabularys }: props) {
  return (
    <Card className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-0 shadow-2xl rounded-3xl overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full -translate-y-14 translate-x-14"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-teal-200/20 to-green-200/20 rounded-full translate-y-10 -translate-x-10"></div>
      <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-emerald-200/10 to-teal-200/10 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

      <CardHeader className="pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
              <BookOpen className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-800 mb-1">Từ vựng gợi ý</CardTitle>
            <p className="text-sm text-gray-600">Các từ vựng hữu ích cho bài viết</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="flex flex-wrap gap-3">
          {vocabularys.map((word, index) => (
            <div
              key={index}
              className="group relative"
            >
              <Badge
                variant="secondary"
                className="bg-white/70 backdrop-blur-sm text-emerald-700 border border-emerald-200/50 hover:bg-white/90 hover:shadow-lg hover:scale-105 transition-all duration-300 px-4 py-2 text-sm font-medium rounded-full cursor-pointer group-hover:border-emerald-300 group-hover:text-emerald-800"
              >
                <span className="relative z-10">{word}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-green-100/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Badge>
              {/* Decorative sparkle for every 3rd item */}
              {index % 3 === 2 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="w-1.5 h-1.5 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state with decorative message */}
        {vocabularys.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-gray-500 text-sm">Chưa có từ vựng gợi ý nào</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

