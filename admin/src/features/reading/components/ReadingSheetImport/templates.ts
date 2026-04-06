import * as XLSX from 'xlsx'

export function buildExcelTemplateWorkbook() {
  const readings = [
    {
      ID: 'reading-1',
      title: 'Sample Reading',
      description: 'A sample description',
      level: 'A1',
      paragraphEn: 'English paragraph...',
      paragraphVi: 'Đoạn văn tiếng Việt...',
      imageID: 'media_id_for_image',
      isActive: 'true',
      isVipRequired: 'true',
    },
  ]

  const vocabulary = [
    {
      ReadingID: 'reading-1',
      word: 'Example',
      phonetic: '/ɪɡˈzɑːm.pl̩/',
      definition: 'A thing characteristic of its kind',
      vietnamese: 'Ví dụ',
      example: 'This is an example.',
    },
  ]

  const quizzes = [
    {
      ReadingID: 'reading-1',
      question: 'What is this?',
      type: 'Multiple Choice',
      'options (separated by |)': 'Option A | Option B | Option C',
      answer: 'Option A',
      explanation: 'Because it is Option A.',
    },
  ]

  const wsReadings = XLSX.utils.json_to_sheet(readings)
  const wsVocabulary = XLSX.utils.json_to_sheet(vocabulary)
  const wsQuizzes = XLSX.utils.json_to_sheet(quizzes)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsReadings, 'Readings')
  XLSX.utils.book_append_sheet(wb, wsVocabulary, 'Vocabulary')
  XLSX.utils.book_append_sheet(wb, wsQuizzes, 'Quizzes')

  return wb
}

export function buildJsonTemplateData() {
  return [
    {
      title: 'Sample Reading',
      description: 'A sample description',
      level: 'A1',
      paragraphEn: 'English paragraph...',
      paragraphVi: 'Đoạn văn tiếng Việt...',
      image: 'media_id_for_image',
      isActive: true,
      isVipRequired: true,
      vocabulary: [
        {
          word: 'Example',
          phonetic: '/ɪɡˈzɑːm.pl̩/',
          definition: 'A thing characteristic of its kind',
          vietnamese: 'Ví dụ',
          example: 'This is an example.',
        },
      ],
      quizzes: [
        {
          question: 'What is this?',
          type: 'Multiple Choice',
          options: ['Option A', 'Option B', 'Option C'],
          answer: 'Option A',
          explanation: 'Because it is Option A.',
        },
      ],
    },
  ]
}
