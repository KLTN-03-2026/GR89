export { ChatProvider, useChat } from '../../libs/contexts/ChatProvider'
export type { ChatType } from '../../libs/contexts/ChatProvider'

export { default as AIChatButton } from './components/chatbot/AIChatButton'
export { default as AIChatWindow } from './components/chatbot/AIChatWindow'
export { HumanChatButton, HumanChatWindow } from './components/chatHuman'

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
