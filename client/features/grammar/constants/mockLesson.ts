import { GrammarLessonFlowData } from '@/features/grammar/types'

export const mockGrammarLesson: GrammarLessonFlowData = {
  title: 'PRESENT SIMPLE',
  sections: [
    {
      id: 's1',
      title: 'Định nghĩa',
      description: 'Hiện tại đơn dùng để diễn tả thói quen, sự thật hiển nhiên hoặc lịch trình cố định.',
      note: 'Dấu hiệu thường gặp: always, usually, often, sometimes, never.',
      examples: [
        { en: 'I walk to school every day.', vi: 'Tôi đi bộ đến trường mỗi ngày.' },
        { en: 'The sun rises in the East.', vi: 'Mặt trời mọc ở đằng Đông.' }
      ]
    },
    {
      id: 's2',
      title: 'Công thức',
      formula: 'Khẳng định: S + V(s/es) | Phủ định: S + do/does not + V | Nghi vấn: Do/Does + S + V?',
      list: ['He/She/It: thêm s/es', 'I/You/We/They: động từ nguyên mẫu'],
      note: 'Sau does/does not luôn dùng động từ nguyên mẫu.'
    },
    {
      id: 's3',
      title: 'Bảng so sánh nhanh',
      table: {
        headers: ['Present Simple', 'Present Continuous'],
        rows: [
          ['I go to school every day.', 'I am going to school now.'],
          ['Water boils at 100 C.', 'She is living with her aunt this month.']
        ]
      }
    },
    {
      id: 's4',
      title: 'Quy tắc thêm s/es',
      list: [
        'Động từ thường: thêm -s (play -> plays).',
        'Kết thúc bằng s, x, sh, ch, o: thêm -es (go -> goes).',
        'Kết thúc bằng phụ âm + y: đổi y -> ies (study -> studies).'
      ]
    }
  ],
  practice: [
    {
      id: 'p1',
      type: 'fill_blank',
      question: 'Điền từ đúng: She ____ (go) to school by bus.',
      answer: 'goes',
      hint: 'She/he/it + V(s/es)'
    },
    {
      id: 'p2',
      type: 'multiple_choice',
      question: 'Chọn câu đúng:',
      options: [
        'He play football every Sunday.',
        'He plays football every Sunday.',
        'He is play football every Sunday.'
      ],
      answer: 'He plays football every Sunday.',
      hint: 'He + plays'
    },
    {
      id: 'p3',
      type: 'correct_sentence',
      question: 'Sửa câu sai thành câu đúng:',
      wrongSentence: "She don't like coffee.",
      answer: "She doesn't like coffee.",
      hint: 'Phủ định với she/he/it dùng does not + V.'
    }
  ],
  quizQuestions: [
    {
      id: 'q1',
      question: 'Dấu hiệu nào thường đi với Present Simple?',
      options: ['now', 'at the moment', 'every day'],
      answer: 'every day'
    },
    {
      id: 'q2',
      question: 'Câu nào đúng?',
      options: [
        'My brother study English.',
        'My brother studies English.',
        'My brother studying English.'
      ],
      answer: 'My brother studies English.'
    },
    {
      id: 'q3',
      question: 'Phủ định đúng là:',
      options: ["She doesn't likes tea.", "She doesn't like tea.", "She don't like tea."],
      answer: "She doesn't like tea."
    }
  ]
}
