export { ChatProvider, useChat } from './context/ChatProvider'
export type { ChatType } from './context/ChatProvider'

export { default as AIChatButton } from './components/AIChatButton'
export { default as AIChatWindow } from './components/AIChatWindow'
export { default as HumanSupportButton } from './components/HumanSupportButton'

export { useChatbot } from './hooks/useChatbot'

export type {
  Exercise,
  ExerciseResult,
  ExerciseType,
  FillBlankQuestion,
  MultipleChoiceQuestion,
  QuestionResult,
  TranslationQuestion,
} from './types'
