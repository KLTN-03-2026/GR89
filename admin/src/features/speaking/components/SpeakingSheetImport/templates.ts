import * as XLSX from 'xlsx'

export function buildExcelTemplateWorkbook() {
  const speakings = [
    {
      ID: 'speaking-1',
      title: 'Speaking Lesson 1',
      description: 'Sample speaking lesson description',
      level: 'A1',
      videoID: 'media_id_for_video',
      isActive: 'true',
      isVipRequired: 'false',
      orderIndex: 1
    },
  ]

  const subtitles = [
    {
      SpeakingID: 'speaking-1',
      start: '00:00:00',
      end: '00:00:05',
      english: 'Hello, how are you today?',
      phonetic: '/həˈloʊ, haʊ ɑːr juː təˈdeɪ?/',
      vietnamese: 'Xin chào, bạn khỏe không?',
      raw: 'Hello, how are you today?',
    },
  ]

  const wsSpeakings = XLSX.utils.json_to_sheet(speakings)
  const wsSubtitles = XLSX.utils.json_to_sheet(subtitles)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsSpeakings, 'Speakings')
  XLSX.utils.book_append_sheet(wb, wsSubtitles, 'Subtitles')

  return wb
}

export function buildJsonTemplateData() {
  return [
    {
      title: 'Speaking Lesson 1',
      description: 'Sample speaking lesson description',
      videoUrl: 'media_id_for_video',
      level: 'A1',
      isVipRequired: false,
      isActive: true,
      subtitles: [
        {
          start: '00:00:00',
          end: '00:00:05',
          english: 'Hello, how are you today?',
          phonetic: '/həˈloʊ, haʊ ɑːr juː təˈdeɪ?/',
          vietnamese: 'Xin chào, bạn khỏe không?',
          raw: 'Hello, how are you today?',
        },
      ],
    },
  ]
}
