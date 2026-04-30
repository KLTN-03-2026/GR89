import { IQuiz } from "../quizz";

export interface IListening {
  quizzes: IQuiz[]
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

export interface IDiffPart {
  value: string
  added?: boolean
  removed?: boolean
}

export interface IListeningProgress {
  progress: number
  point: number
  totalQuestions?: number
  quizPoint: number
  quizTotal: number
  quizProgress?: number
  time: number
  date: Date
  result: IDiffPart[]
  listeningId: IListening
}