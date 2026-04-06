'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowLeft, Home, RotateCcw, Trophy, Star } from "lucide-react";
import CardDetailResultQuizz from "./CardDetailResultQuizz";
import { useRouter } from "next/navigation";
import { IQuizResult } from "@/features/quizz/types";
import { ROUTES } from "@/constants/routes";

interface SummaryResultsProps {
  results: IQuizResult[] | [];
  onRetry: () => void;
  type: 'vocabulary' | 'reading' | 'grammar';
}

export default function SummaryResults({
  results,
  onRetry,
  type
}: SummaryResultsProps) {
  const router = useRouter();

  const totalQuestions = Array.isArray(results) ? results.length : 0;
  const correctAnswers = Array.isArray(results) ? results.filter(result =>
    (result.correctAnswer || "").toLowerCase().trim() === (result.userAnswer || "").toLowerCase().trim()).length : 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const getScoreMessage = () => {
    if (percentage >= 90) return "Xuất sắc! Bạn đã nắm vững kiến thức.";
    if (percentage >= 80) return "Tốt! Bạn hiểu rất tốt về chủ đề này.";
    if (percentage >= 70) return "Khá! Bạn cần ôn lại một chút.";
    if (percentage >= 60) return "Trung bình! Hãy xem lại các ngữ cảnh thực tế.";
    return "Cần cải thiện! Hãy xem lại các ngữ cảnh thực tế và thử lại.";
  };

  const getScoreGradient = () => {
    if (percentage >= 90) return "from-green-400 to-green-600";
    if (percentage >= 80) return "from-blue-400 to-blue-600";
    if (percentage >= 70) return "from-yellow-400 to-yellow-600";
    if (percentage >= 60) return "from-orange-400 to-orange-600";
    return "from-red-400 to-red-600";
  };

  const getScoreIcon = () => {
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👍";
    if (percentage >= 60) return "😊";
    return "😔";
  };

  const getScoreStars = () => {
    const stars = Math.ceil(percentage / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 ${i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const onBack = () => {
    router.back();
  };

  const link = (type: 'vocabulary' | 'reading' | 'grammar') => {
    switch (type) {
      case 'vocabulary':
        return ROUTES.ROUTES_PATH.VOCABULARY;
      case 'reading':
        return ROUTES.ROUTES_PATH.READING;
      case 'grammar':
        return ROUTES.ROUTES_PATH.GRAMMAR;
      default:
        return ROUTES.ROUTES_PATH.HOME;
    }
  }
  const onHome = () => {
    router.push(`${link(type)}`);
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 overflow-y-auto mt-5 mx-5 border-2 border-gray-200">
      <CardHeader className="text-center space-y-2">
        {/* Score Display */}
        <div className="relative">
          <div className={`text-8xl font-bold bg-gradient-to-r ${getScoreGradient()} bg-clip-text text-transparent`}>
            {percentage}%
          </div>
          <div className="absolute -top-2 -right-2 text-4xl animate-bounce">
            {getScoreIcon()}
          </div>
        </div>

        {/* Stars Rating */}
        <div className="flex justify-center gap-1">
          {getScoreStars()}
        </div>

        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-800">
            {correctAnswers}/{totalQuestions} câu đúng
          </CardTitle>
          <CardDescription className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
            {getScoreMessage()}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <CardTitle className="text-xl text-gray-800">Chi tiết từng câu hỏi:</CardTitle>
        </div>

        <Carousel className="w-[80%] mx-auto">
          <CarouselContent className="w-full">
            {(results && results.length > 0 && results.map((result) => (
              <CarouselItem className="w-full" key={result.questionNumber}>
                <div className="p-2">
                  <CardDetailResultQuizz
                    question={result.question}
                    questionNumber={result.questionNumber}
                    userAnswer={result.userAnswer}
                    correctAnswer={result.correctAnswer}
                    isCorrect={result.correctAnswer === result.userAnswer}
                    explanation={result.explanation}
                  />
                </div>
              </CarouselItem>
            )))}
          </CarouselContent>
          <CarouselPrevious className="hover:bg-primary/10 cursor-pointer border-2 hover:border-primary transition-colors" />
          <CarouselNext className="hover:bg-primary/10 cursor-pointer border-2 hover:border-primary transition-colors" />
        </Carousel>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onHome}
            className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Button>

          <Button
            onClick={onRetry}
            className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}