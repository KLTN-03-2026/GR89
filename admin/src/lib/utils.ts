import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function checkUrlVideo(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'iframe'
  }

  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    return 'video'
  }

  return null
}

export function onDownloadJsonTemplate(template: string) {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function onDownloadExcelTemplate(template: string) {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template.xlsx'
  a.click()
  URL.revokeObjectURL(url)
}