export interface IListening {
  quiz?: {
    question: string
    options: string[]
    answer: string
  }[]
  _id: string;
  title: string;
  description: string;
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
  time: number
  date: Date
  result: {
    index: number
    text: string
    isCorrect: boolean
  }[]
  listeningId: IListening
}