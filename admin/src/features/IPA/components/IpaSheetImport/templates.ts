import * as XLSX from 'xlsx'

export function buildExcelTemplateWorkbook() {
  const ipas = [
    {
      ID: 'ipa-1',
      sound: '/æ/',
      soundType: 'vowel',
      imageID: 'media_id_for_image',
      videoID: 'media_id_for_video',
      description: 'Mở miệng rộng, lưỡi hạ thấp...',
    },
  ]

  const examples = [
    {
      IPA_ID: 'ipa-1',
      word: 'cat',
      phonetic: '/kæt/',
      vietnamese: 'con mèo',
    },
    {
      IPA_ID: 'ipa-1',
      word: 'apple',
      phonetic: '/ˈæpl/',
      vietnamese: 'quả táo',
    },
  ]

  const wsIpa = XLSX.utils.json_to_sheet(ipas)
  const wsExample = XLSX.utils.json_to_sheet(examples)

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, wsIpa, 'IPAs')
  XLSX.utils.book_append_sheet(wb, wsExample, 'Examples')

  return wb
}

export function buildJsonTemplateData() {
  return [
    {
      sound: '/æ/',
      soundType: 'vowel',
      image: 'media_id_for_image',
      video: 'media_id_for_video',
      description: 'Mở miệng rộng, lưỡi hạ thấp...',
      isVipRequired: false,
      isActive: true,
      examples: [
        {
          word: 'cat',
          phonetic: '/kæt/',
          vietnamese: 'con mèo',
        },
      ],
    },
  ]
}
