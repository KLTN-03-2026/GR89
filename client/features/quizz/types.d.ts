export interface IQuiz {
  _id: string
  assignment: string
  question: string
  type: 'Multiple Choice' | 'Fill in the blank'
  options: string[]
  answer: string
  explanation: string
}

export interface IQuizResult {
  questionNumber: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export interface IQuizResultData {
  questionNumber: number;
  userAnswer: string;
  quizId: string;
  isCorrect: boolean;
}