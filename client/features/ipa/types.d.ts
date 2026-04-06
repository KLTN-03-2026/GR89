export interface IIpa {
  _id: string
  sound: string
  soundType: 'vowel' | 'consonant' | 'diphthong'
  image: string
  video: string
  description: string
  examples: {
    word: string
    phonetic: string
    vietnamese: string
  }[]
  progress: number
  isVipRequired?: boolean
}
