import * as XLSX from 'xlsx'

export function buildExcelTemplateWorkbook() {
  const listenings = [
    {
      ID: 'listening-1',
      title: 'Listening Lesson 1',
      description: 'Sample listening lesson description',
      level: 'A1',
      audioID: 'media_id_for_audio',
      subtitle: 'This is the subtitle of the lesson.',
      isActive: 'true',
      isVipRequired: 'false',
      orderIndex: 1
    },
  ]

  const ws = XLSX.utils.json_to_sheet(listenings)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Listenings')

  return wb
}

export function buildJsonTemplateData() {
  return [
    {
      title: 'Listening Lesson 1',
      description: 'Sample listening lesson description',
      audio: 'media_id_for_audio',
      subtitle: 'This is the subtitle of the lesson.',
      level: 'A1',
      isVipRequired: false,
      isActive: true,
    },
  ]
}
