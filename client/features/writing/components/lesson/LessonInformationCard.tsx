import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Target } from 'lucide-react'

interface props {
  title: string
  description: string
  minWords: number
  maxWords: number
  timeLimit: number
}

export default function LessonInformationCard({ title, description, minWords, maxWords, timeLimit }: props) {
  return (
    <Card className='pt-0 overflow-hidden'>
      <CardHeader className="text-white bg-gradient-to-r from-blue-500 to-blue-300 p-4">
        <div className='flex items-center gap-2'>
          <CardTitle>
            ✍️
          </CardTitle>
          <CardDescription className="text-2xl font-semibold">Thông tin bài học</CardDescription>
        </div>
        <p className="text-lg font-semibold">{title}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">{description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-center">
            <Target className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Số từ</div>
            <div className="font-semibold text-blue-600">{minWords}-{maxWords}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl text-center">
            <Clock className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Thời gian</div>
            <div className="font-semibold text-orange-600">{timeLimit} phút</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

