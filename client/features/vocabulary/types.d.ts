export interface VocabularyTopics {
  _id: string
  name: string
  image: {
    _id: string
    url: string
  }
  orderIndex: number
  isActive: boolean
  isVipRequired?: boolean
  isCompleted: boolean
  point: number
  isResult: boolean
  vocabularies: Vocabulary[]
}

export interface Vocabulary {
  "_id": string
  "word": string
  "transcription": string
  "partOfSpeech": string
  "definition": string
  "vietnameseMeaning": string
  "example": string
  "image": {
    _id: string
    url: string
  }
  "vocabularyTopicId": string
  "quizId": string
}