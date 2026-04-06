export interface Quiz {
  _id: string
  question: string
  type: 'Multiple Choice' | 'Fill in the blank'
  options?: string[]
  answer: string
  explanation: string
}