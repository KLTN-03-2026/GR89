export interface writingTopics {
  _id: string
  title: string
  description: string
  minWords: number
  maxWords: number
  duration: number
  suggestedVocabulary: string[]
  suggestedStructure: {
    _id: string
    title: string
    description: string
  }[]
  orderIndex: number
  progress: number
  isCompleted: boolean
  isActive: boolean
  isVipRequired?: boolean
  isResult: boolean
}

export interface writing {
  _id: string
  title: string
  description: string
  minWords: number
  maxWords: number
  duration: number
  suggestedVocabulary: string[]
  suggestedStructure: {
    _id: string
    title: string
    description: string
    step: number
  }[]
}

export interface resultWriting {
  content: string
  revisedContent: string
  rubricContent: {
    point: number
    feedback: string[]
  }
  rubricStructure: {
    point: number
    feedback: string[]
  }
  rubricGrammar: {
    point: number
    feedback: string[]
  }
  rubricVocabulary: {
    point: number
    feedback: string[]
  }
  overallFeedback: string
  suggested: string[]
}
