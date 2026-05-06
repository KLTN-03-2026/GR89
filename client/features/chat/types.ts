/* AI Chat Exercise System */
export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'translation'

export interface ExerciseQuestion {
  id: string
  type: ExerciseType
  question: string
  explanation: string
}

export interface MultipleChoiceQuestion extends ExerciseQuestion {
  type: 'multiple-choice'
  options: Array<{
    label: string
    value: string
    isCorrect: boolean
  }>
}

export interface FillBlankQuestion extends ExerciseQuestion {
  type: 'fill-blank'
  correctAnswers: string[]
}

export interface TranslationQuestion extends ExerciseQuestion {
  type: 'translation'
  correctAnswers: string[]
}

export interface Exercise {
  id: string
  title?: string
  questions: Array<MultipleChoiceQuestion | FillBlankQuestion | TranslationQuestion>
}

export interface QuestionResult {
  questionId: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
  explanation: string
}

export interface ExerciseResult {
  exerciseId: string
  totalQuestions: number
  correctAnswers: number
  percentage: number
  results: QuestionResult[]
}

export interface ChatUser {
  _id: string
  role: string
  fullName?: string
  email?: string
  avatar?: string
}

export type ChatMessageType = 'text' | 'system'
export type ChatAttachmentType = 'image' | 'file'

export interface ChatAttachment {
  type: ChatAttachmentType
  url: string
  name?: string
  size?: number | null
  mimeType?: string
}

export interface ChatMessage {
  _id: string
  sender: ChatUser
  type?: ChatMessageType
  content: string
  createdAt: string | Date
  attachments?: ChatAttachment[]
}

export interface ChatConversation {
  _id: string
  requester: ChatUser
  assignedTo?: ChatUser | null
  status?: 'open' | 'closed'
  waitingFor?: 'assignee' | 'requester'
  messages: ChatMessage[]
  lastMessageAt?: string | Date | null
  lastRequesterMessageAt?: string | Date | null
  lastAssigneeMessageAt?: string | Date | null
  requesterLastReadAt?: string | Date | null
  countUnRead?: number
  lastMessagePreview?: string
}
