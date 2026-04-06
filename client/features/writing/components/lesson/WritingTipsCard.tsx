import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Sparkles } from "lucide-react";

interface props {
  structures: {
    _id: string
    title: string
    description: string
    step: number
  }[]
}

export default function WritingTipsCard({ structures }: props) {
  return (
    <Card className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-0 shadow-2xl rounded-3xl overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-200/20 to-yellow-200/20 rounded-full translate-y-12 -translate-x-12"></div>

      <CardHeader className="pb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-800 mb-1">Gợi ý viết bài</CardTitle>
            <p className="text-sm text-gray-600">Các bước hướng dẫn chi tiết</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {structures.map((structure, index) => (
          <div
            key={structure._id}
            className="group flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                <span className="text-sm font-bold text-white">{structure.step}</span>
              </div>
              {index < structures.length - 1 && (
                <div className="absolute top-8 left-1/2 w-0.5 h-8 bg-gradient-to-b from-orange-300 to-amber-300 transform -translate-x-1/2"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 mb-2 text-base group-hover:text-orange-600 transition-colors duration-300">
                {structure.title}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                {structure.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

