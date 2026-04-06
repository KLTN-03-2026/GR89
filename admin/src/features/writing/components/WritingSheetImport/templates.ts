import * as XLSX from 'xlsx'

export function buildExcelTemplateWorkbook() {
  const writings = [
    {
      writingId: 'writing-1',
      title: 'IELTS Writing Task 2: Environment',
      description: 'Some people think that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?',
      level: 'B2',
      minWords: 250,
      maxWords: 300,
      duration: 40,
      suggestedVocabulary: 'pollution | fossil fuels | sustainable | renewable energy | global warming',
      isVipRequired: false,
      isActive: true,
    },
  ]

  const structures = [
    {
      writingKey: 'writing-1',
      step: 1,
      title: 'Introduction',
      description: 'Paraphrase the question and state your opinion.',
    },
    {
      writingKey: 'writing-1',
      step: 2,
      title: 'Body Paragraph 1',
      description: 'Discuss one side of the argument with supporting examples.',
    },
    {
      writingKey: 'writing-1',
      step: 3,
      title: 'Body Paragraph 2',
      description: 'Discuss the other side or further develop your opinion.',
    },
    {
      writingKey: 'writing-1',
      step: 4,
      title: 'Conclusion',
      description: 'Summarize your main points and restate your final position.',
    },
  ]

  const wsWritings = XLSX.utils.json_to_sheet(writings)
  const wsStructures = XLSX.utils.json_to_sheet(structures)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsWritings, 'Writings')
  XLSX.utils.book_append_sheet(wb, wsStructures, 'Structures')

  return wb
}

export function buildJsonTemplateData() {
  return [
    {
      title: 'IELTS Writing Task 2: Environment',
      description: 'Some people think that the best way to solve environmental problems is to increase the price of fuel. To what extent do you agree or disagree?',
      level: 'B2',
      minWords: 250,
      maxWords: 300,
      duration: 40,
      suggestedVocabulary: ['pollution', 'fossil fuels', 'sustainable', 'renewable energy', 'global warming'],
      suggestedStructure: [
        {
          step: 1,
          title: 'Introduction',
          description: 'Paraphrase the question and state your opinion.',
        },
      ],
      isVipRequired: false,
      isActive: true,
    },
  ]
}
