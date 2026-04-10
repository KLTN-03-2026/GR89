export interface IListening {
  quiz?: {
    question: string
    options: string[]
    answer: string
  }[]
  _id: string;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  audio: string;
  subtitle: string;
  subtitleVi?: string;
  isActive: boolean;
  isVipRequired?: boolean;
  isCompleted: boolean;
  progress: number;
  isResult: boolean
}

export interface IListeningProgress {
  progress: number
  point: number
  totalQuestions?: number
  quizPoint?: number
  quizTotal?: number
  quizProgress?: number
  time: number
  date: Date
  result: {
    index: number
    text: string
    isCorrect: boolean
  }[]
  listeningId: IListening
}