import * as XLSX from 'xlsx'
import type { GrammarTopic } from '@/features/grammar/types'

/**
 * Tạo Workbook mẫu cho Excel Import Ngữ pháp
 * Cấu trúc gồm 4 sheet: Topics, Sections, Practice, Quizzes
 */
export function buildExcelTemplateWorkbook() {
  const topics = [
    {
      ID: 'grammar-1',
      title: 'Present Simple',
      description: 'Thì hiện tại đơn dùng để diễn tả thói quen, sự thật hiển nhiên...',
      level: 'A1',
      isActive: 'TRUE',
      isVipRequired: 'FALSE',
      orderIndex: 1
    }
  ]

  const sections = [
    {
      TopicID: 'grammar-1',
      SectionID: 'sec-1',
      title: 'Cấu trúc khẳng định',
      description: 'Cách chia động từ ở thì hiện tại đơn',
      note: 'Thêm -es cho động từ kết thúc bằng: -s, -sh, -ch, -x, -z, -o',
      formula: 'S + V(s/es) + O',
      'list (separated by ;)': 'I/You/We/They + V;He/She/It + V(s/es)',
      'examples (en|vi; en|vi)': 'She plays tennis every Sunday.|Cô ấy chơi tennis mỗi Chủ nhật.;The sun rises in the east.|Mặt trời mọc ở phía đông.'
    }
  ]

  const practice = [
    {
      TopicID: 'grammar-1',
      PracticeID: 'prac-1',
      type: 'fill_blank',
      question: 'She ___ (play) tennis every Sunday.',
      'options (separated by ;)': '',
      wrongSentence: '',
      answer: 'plays',
      hint: 'Ngôi thứ 3 số ít thêm -s/-es'
    },
    {
      TopicID: 'grammar-1',
      PracticeID: 'prac-2',
      type: 'multiple_choice',
      question: 'Which sentence is correct?',
      'options (separated by ;)': 'She play tennis.;She plays tennis.;She playing tennis.',
      wrongSentence: '',
      answer: 'She plays tennis.',
      hint: 'Động từ chia theo chủ ngữ'
    }
  ]

  const quizzes = [
    {
      TopicID: 'grammar-1',
      question: 'What is the correct form of "go" for "She"?',
      type: 'Multiple Choice',
      'options (separated by ;)': 'go;goes;going;went',
      answer: 'goes',
      explanation: 'She is third person singular, so we use "goes".'
    }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(topics), 'Topics')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sections), 'Sections')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(practice), 'Practice')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(quizzes), 'Quizzes')

  return wb
}

/**
 * Tạo dữ liệu mẫu JSON cho Import Ngữ pháp
 */
export function buildJsonTemplateData(): GrammarTopic[] {
  return [
    {
      ID: 'grammar-1',
      title: 'Present Simple',
      description: 'Thì hiện tại đơn dùng để diễn tả thói quen, sự thật hiển nhiên...',
      level: 'A1',
      isActive: true,
      isVipRequired: false,
      sections: [
        {
          title: 'Cấu trúc khẳng định',
          description: 'Cách chia động từ ở thì hiện tại đơn',
          formula: 'S + V(s/es) + O',
          note: 'Thêm -es cho động từ kết thúc bằng: -s, -sh, -ch, -x, -z, -o',
          list: ['I/You/We/They + V', 'He/She/It + V(s/es)'],
          examples: [
            { en: 'She plays tennis every Sunday.', vi: 'Cô ấy chơi tennis mỗi Chủ nhật.' },
            { en: 'The sun rises in the east.', vi: 'Mặt trời mọc ở phía đông.' }
          ]
        }
      ],
      practice: [
        {
          type: 'fill_blank',
          question: 'She ___ (play) tennis every Sunday.',
          answer: 'plays',
          hint: 'Ngôi thứ 3 số ít thêm -s/-es'
        }
      ],
      quizzes: [
        {
          question: 'What is the correct form of "go" for "She"?',
          type: 'Multiple Choice',
          options: ['go', 'goes', 'going', 'went'],
          answer: 'goes',
          explanation: 'She is third person singular, so we use "goes".'
        }
      ]
    } as any // Use any because GrammarTopic might have mandatory fields like _id that aren't needed for template
  ]
}
