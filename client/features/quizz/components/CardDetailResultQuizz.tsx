import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, CheckCircle, XCircle } from "lucide-react";

interface CardDetailResultQuizzProps {
  question: string;
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export default function CardDetailResultQuizz({
  question,
  questionNumber,
  userAnswer,
  correctAnswer,
  isCorrect,
  explanation
}: CardDetailResultQuizzProps) {

  const getIcon = () => {
    return isCorrect ? (
      <CheckCircle className="w-5 h-5 text-white" />
    ) : (
      <XCircle className="w-5 h-5 text-white" />
    );
  };

  const getBorderColor = () => {
    return isCorrect ? "border-green-500" : "border-red-500";
  };

  const getStatusColor = () => {
    return isCorrect ? "bg-green-600" : "bg-red-600";
  };

  return (
    <Card className={`border-l-8 ${getBorderColor()} shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white`}>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-800 text-lg leading-relaxed">
            Câu hỏi {questionNumber}
          </p>
          <div className="font-semibold text-lg">
            <span className={`${getStatusColor()} rounded-full flex items-center justify-center w-6 h-6 shadow-md`}> {getIcon()}</span>
          </div>
        </div>

        <p className="text-gray-600 text-lg font-bold">Complete: {question}.</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gray-600">
            <span className="font-semibold text-sm">Đáp án của bạn:</span>
            <div className="h-8 min-w-8 px-2 rounded-lg flex items-center justify-center text-sm font-bold border-2">
              <span>{userAnswer}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-green-600 ">
            <span className="font-semibold text-sm">Đáp án đúng:</span>
            <div className="h-8 min-w-8 px-2 bg-green-100 border-2 border-green-200 rounded-lg flex items-center justify-center text-sm font-bold">
              <span>{correctAnswer}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 space-y-3">
          <span className="flex items-center gap-2 font-semibold text-blue-800">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Giải thích:
          </span>
          <span className="text-sm text-blue-700 leading-relaxed">{explanation}</span>
        </div>
      </CardContent>
    </Card>
  );
}