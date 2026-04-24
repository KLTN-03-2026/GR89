import { EnhancedPopover } from "@/components/common/popoves";
import { Card } from "@/components/ui/card";
import { Popover } from "@/components/ui/popover";
import { VocabularyTopics } from "@/features/vocabulary/types";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Star, Crown } from "lucide-react";
import Image from "next/image";

interface CardVocabularyTopicProps {
  topic: VocabularyTopics
}

export default function CardVocabularyTopic({ topic }: CardVocabularyTopicProps) {
  const level = topic.level as string | undefined
  return (
    <div className="w-full cursor-pointer h-full">
      <Popover>
        <div className='text-center group h-full'>
          <PopoverTrigger className='w-full h-full'>
            <Card className='relative transition-all duration-500 ease-out p-4 h-full flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300 shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden'>
              {/* Animated Background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-lg animate-pulse delay-500"></div>
              </div>

              {/* Main Content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Header: VIP indicator and Star */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {topic.isVipRequired ? (
                      <div className="flex items-center gap-1 bg-yellow-100 rounded-full px-2 py-1">
                        <Crown className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        <span className="text-[10px] font-semibold text-yellow-700">VIP</span>
                      </div>
                    ) : null}
                    {level ? (
                      <div className="flex items-center rounded-full px-2 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200">
                        <span className="text-[10px] font-semibold">{level}</span>
                      </div>
                    ) : null}
                  </div>

                  <Star className={`w-5 h-5 ${topic.isCompleted ? 'fill-yellow-400 text-yellow-500 animate-pulse' : 'fill-gray-300 text-gray-400'
                    }`} />
                </div>

                {/* Image Container */}
                <div className='relative mb-4 flex-shrink-0'>
                  <div className='relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-2 shadow-2xl border border-gray-100'>
                    <div className="relative overflow-hidden rounded-2xl">
                      <Image
                        src={topic.image.url}
                        alt={topic.name}
                        width={240}
                        height={240}
                        className="w-full aspect-square object-cover object-center transition-all duration-500 group-hover:scale-105"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-bold uppercase text-lg mb-4 transition-all duration-300 flex-shrink-0 text-center">
                  {topic.name}
                </h4>

                {/* Progress Section */}
                <div className="space-y-3 flex-1 flex flex-col justify-end mt-auto">
                  <div className="relative">
                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div className='h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000 ease-out'
                        style={{ width: `${topic.point}%` }}>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-white drop-shadow-lg">
                        {Math.round(topic.point)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tiến độ học tập</span>
                    <span className="font-bold text-gray-800">{Math.round(topic.point)}%</span>
                  </div>
                </div>
              </div>
            </Card>

            <EnhancedPopover
              href={`/study/vocabulary/${topic._id}`}
              skill="vocabulary"
              isCompleted={topic.isCompleted}
              resultId={topic._id}
            />
          </PopoverTrigger>
        </div>
      </Popover>
    </div>
  );
}
