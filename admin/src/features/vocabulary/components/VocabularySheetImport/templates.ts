import * as XLSX from 'xlsx'

export function buildExcelTemplateWorkbook() {
  const topics = [
    {
      topicId: 'topic-1',
      name: 'Family',
      image: 'media_id_for_topic_image',
      level: 'A1',
      isVipRequired: false,
      isActive: true,
    },
  ]

  const vocabularies = [
    {
      topicKey: 'topic-1',
      word: 'Father',
      transcription: '/ˈfɑː.ðər/',
      partOfSpeech: 'Noun',
      definition: 'A male parent',
      vietnameseMeaning: 'Bố',
      example: 'My father is a doctor.',
      image: 'media_id_for_word_image',
    },
    {
      topicKey: 'topic-1',
      word: 'Mother',
      transcription: '/ˈmʌð.ər/',
      partOfSpeech: 'Noun',
      definition: 'A female parent',
      vietnameseMeaning: 'Mẹ',
      example: 'My mother is a teacher.',
      image: 'media_id_for_word_image',
    },
  ]

  const quizzes = [
    {
      topicKey: 'topic-1',
      type: 'Multiple Choice',
      question: 'What is "Bố" in English?',
      options: 'Father | Mother | Brother | Sister',
      answer: 'Father',
      explanation: 'Father means "Bố" in Vietnamese.',
    },
  ]

  const wsTopics = XLSX.utils.json_to_sheet(topics)
  const wsVocabularies = XLSX.utils.json_to_sheet(vocabularies)
  const wsQuizzes = XLSX.utils.json_to_sheet(quizzes)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsTopics, 'Topics')
  XLSX.utils.book_append_sheet(wb, wsVocabularies, 'Vocabularies')
  XLSX.utils.book_append_sheet(wb, wsQuizzes, 'Quizzes')

  return wb
}

export function buildJsonTemplateData() {
  return [
    {
      name: 'Family',
      image: 'media_id_for_topic_image',
      level: 'A1',
      isVipRequired: false,
      isActive: true,
      words: [
        {
          word: 'Father',
          transcription: '/ˈfɑː.ðər/',
          partOfSpeech: 'Noun',
          definition: 'A male parent',
          vietnameseMeaning: 'Bố',
          example: 'My father is a doctor.',
          image: 'media_id_for_word_image',
        },
      ],
      quizzes: [
        {
          type: 'Multiple Choice',
          question: 'What is "Bố" in English?',
          options: ['Father', 'Mother', 'Brother', 'Sister'],
          answer: 'Father',
          explanation: 'Father means "Bố" in Vietnamese.',
        },
      ],
    },
  ]
}
