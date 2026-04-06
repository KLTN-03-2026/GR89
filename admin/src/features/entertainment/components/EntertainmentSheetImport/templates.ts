import * as XLSX from 'xlsx'

export function buildExcelTemplateWorkbook() {
  const entertainments = [
    {
      ID: 'video-1',
      title: 'Sample Video Title',
      description: 'A sample description for the video.',
      author: 'Author Name',
      type: 'movie',
      isActive: 'TRUE',
      isVipRequired: 'FALSE',
      videoID: 'media_id_for_video',
      thumbnailID: 'media_id_for_thumbnail',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(entertainments)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Entertainments')

  return wb
}

export function buildJsonTemplateData() {
  return [
    {
      title: 'Sample Video Title',
      description: 'A sample description for the video.',
      author: 'Author Name',
      type: 'movie',
      isActive: true,
      isVipRequired: false,
      videoUrl: 'media_id_for_video',
      thumbnailUrl: 'media_id_for_thumbnail',
    },
  ]
}
