import { EnhancedPopover } from "@/components/common/popoves";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import {
  Star,
  BookOpen,
  Crown,
} from "lucide-react";
import { IReading } from "../../types";

interface CardReadingTopicProps {
  topic: IReading
}

export default function CardReadingTopic({ topic }: CardReadingTopicProps) {
  const level = topic.level as string | undefined
  return (
    <Popover>
      <PopoverTrigger className='w-full text-center group'>
        <Card className='relative flex flex-col h-full justify-between transition-all duration-500 ease-out p-6 bg-white border-2 border-blue-300 shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden'>
          <CardHeader className="relative z-10 p-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-1">
                {topic.isVipRequired && (
                  <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
                <Star className={`w-5 h-5 ${topic.isCompleted ? 'fill-yellow-400 text-yellow-500 animate-pulse' : 'fill-gray-300 text-gray-400'}`} />
              </div>
              {level ? (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {level}
                </span>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <CardTitle className='font-bold text-lg mb-2 transition-all duration-300 text-gray-800 group-hover:text-indigo-600'>{topic.title}</CardTitle>
            <CardDescription className='text-sm mb-4 line-clamp-2 text-gray-600'>{topic.description}</CardDescription>

            {/* 3 BookOpen Icons */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600'>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600'>
                <BookOpen className="w-4 h-4" />
              </div>
              <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600'>
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-0 space-y-3 flex flex-col">
            <Progress value={topic.progress} className="bg-blue-100! [&>div]:bg-blue-500!" />

            <div className="flex justify-between text-xs w-full">
              <span className="text-gray-600">Tiến độ đọc</span>
              <span className="font-bold text-gray-800">{Math.round(topic.progress)}%</span>
            </div>
          </CardFooter>
        </Card>
      </PopoverTrigger>

      <EnhancedPopover
        href={`/skills/reading/lesson/${topic._id}`}
        skill="reading"
        resultId={topic._id}
        isCompleted={topic.isResult}
      />
    </Popover>
  );
}
