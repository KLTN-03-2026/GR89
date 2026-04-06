'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Mail, Megaphone, ShoppingBag, Newspaper, FileText, ClipboardList, Paperclip } from 'lucide-react'

export type PassageFormat = 'email' | 'notice' | 'advertisement' | 'article' | 'memo' | 'form'

interface ReadingPassageProps {
  title: string
  description: string
  content: string
  format: PassageFormat
  image?: { url: string; width?: number; height?: number }
}

const formatConfig: Record<PassageFormat, {
  icon: React.ElementType
  label: string
  headerBg: string
  headerText: string
  borderColor: string
  bodyBg: string
  accentColor: string
}> = {
  email: {
    icon: Mail,
    label: 'Email',
    headerBg: 'bg-gradient-to-r from-blue-600 to-blue-500',
    headerText: 'text-white',
    borderColor: 'border-blue-200',
    bodyBg: 'bg-white',
    accentColor: 'blue',
  },
  notice: {
    icon: Megaphone,
    label: 'Notice / Announcement',
    headerBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    headerText: 'text-white',
    borderColor: 'border-amber-200',
    bodyBg: 'bg-amber-50/20',
    accentColor: 'amber',
  },
  advertisement: {
    icon: ShoppingBag,
    label: 'Advertisement',
    headerBg: 'bg-gradient-to-r from-rose-500 to-pink-500',
    headerText: 'text-white',
    borderColor: 'border-rose-200',
    bodyBg: 'bg-white',
    accentColor: 'rose',
  },
  article: {
    icon: Newspaper,
    label: 'Article',
    headerBg: 'bg-gradient-to-r from-gray-800 to-gray-700',
    headerText: 'text-white',
    borderColor: 'border-gray-200',
    bodyBg: 'bg-white',
    accentColor: 'gray',
  },
  memo: {
    icon: FileText,
    label: 'Memo',
    headerBg: 'bg-gradient-to-r from-emerald-600 to-teal-500',
    headerText: 'text-white',
    borderColor: 'border-emerald-200',
    bodyBg: 'bg-white',
    accentColor: 'emerald',
  },
  form: {
    icon: ClipboardList,
    label: 'Form / Document',
    headerBg: 'bg-gradient-to-r from-violet-600 to-purple-500',
    headerText: 'text-white',
    borderColor: 'border-violet-200',
    bodyBg: 'bg-white',
    accentColor: 'violet',
  },
}

export default function ReadingPassage({ title, description, content, format, image }: ReadingPassageProps) {
  const cfg = formatConfig[format]
  const Icon = cfg.icon

  return (
    <div className={`h-full flex flex-col rounded-2xl border ${cfg.borderColor} overflow-hidden shadow-sm bg-white`}>
      {/* Document header */}
      <div className={`shrink-0 ${cfg.headerBg} ${cfg.headerText} px-5 py-3.5 flex items-center gap-3`}>
        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold opacity-75 uppercase tracking-widest">{cfg.label}</div>
          <div className="font-semibold text-sm truncate mt-0.5">{title}</div>
        </div>
      </div>

      {/* Description bar */}
      {description && (
        <div className={`shrink-0 px-5 py-2.5 border-b ${cfg.borderColor} bg-gray-50/80`}>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <Paperclip className="w-3 h-3 shrink-0" />
            {description}
          </p>
        </div>
      )}

      {/* Document body */}
      <div className={`flex-1 min-h-0 overflow-y-auto ${cfg.bodyBg}`}>
        {image?.url && (
          <div className="px-5 pt-4">
            <Image
              src={image.url}
              alt={title}
              width={image.width || 800}
              height={image.height || 200}
              className="w-full max-h-48 object-cover rounded-lg shadow-sm"
            />
          </div>
        )}

        <div className="px-5 py-5">
          {format === 'email' ? (
            <EmailLayout content={content} />
          ) : format === 'memo' ? (
            <MemoLayout content={content} />
          ) : format === 'advertisement' ? (
            <AdvertisementLayout content={content} />
          ) : format === 'notice' ? (
            <NoticeLayout content={content} />
          ) : format === 'form' ? (
            <FormLayout content={content} />
          ) : (
            <ArticleLayout content={content} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Email ──────────────────────────────────────────────────────────────── */
function EmailLayout({ content }: { content: string }) {
  const lines = content.split('\n')
  const headerLines: string[] = []
  const bodyLines: string[] = []
  let inBody = false

  for (const line of lines) {
    if (!inBody && (line.startsWith('From:') || line.startsWith('To:') || line.startsWith('Subject:') || line.startsWith('Date:') || line.startsWith('CC:') || line.startsWith('BCC:'))) {
      headerLines.push(line)
    } else {
      inBody = true
      bodyLines.push(line)
    }
  }

  return (
    <div className="space-y-4">
      {headerLines.length > 0 && (
        <div className="rounded-lg bg-blue-50/60 border border-blue-100 p-3.5 space-y-1.5">
          {headerLines.map((line, i) => {
            const colonIdx = line.indexOf(':')
            const label = line.slice(0, colonIdx)
            const value = line.slice(colonIdx + 1).trim()
            return (
              <div key={i} className="flex text-sm gap-2">
                <span className="font-semibold text-blue-700 shrink-0 w-16">{label}:</span>
                <span className="text-gray-700">{value}</span>
              </div>
            )
          })}
        </div>
      )}
      <div className="text-sm leading-[1.8] text-gray-800 whitespace-pre-line">
        {bodyLines.join('\n').trim() || content}
      </div>
    </div>
  )
}

/* ─── Memo ───────────────────────────────────────────────────────────────── */
function MemoLayout({ content }: { content: string }) {
  const lines = content.split('\n')
  const metaLines: string[] = []
  const bodyLines: string[] = []
  let inBody = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inBody && (trimmed.startsWith('TO:') || trimmed.startsWith('FROM:') || trimmed.startsWith('DATE:') || trimmed.startsWith('RE:') || trimmed === 'MEMORANDUM')) {
      if (trimmed !== 'MEMORANDUM') metaLines.push(trimmed)
    } else if (trimmed === '' && !inBody && metaLines.length > 0) {
      inBody = true
    } else {
      inBody = true
      bodyLines.push(line)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-block text-xs font-bold text-emerald-700 uppercase tracking-[0.2em] border-b-2 border-emerald-300 pb-1">
          Memorandum
        </div>
      </div>

      {metaLines.length > 0 && (
        <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-3.5 space-y-1.5">
          {metaLines.map((line, i) => {
            const colonIdx = line.indexOf(':')
            const label = line.slice(0, colonIdx)
            const value = line.slice(colonIdx + 1).trim()
            return (
              <div key={i} className="flex text-sm gap-2">
                <span className="font-semibold text-emerald-700 shrink-0 min-w-[50px]">{label}:</span>
                <span className="text-gray-700">{value}</span>
              </div>
            )
          })}
        </div>
      )}

      <div className="text-sm leading-[1.8] text-gray-800 whitespace-pre-line">
        {bodyLines.join('\n').trim() || content}
      </div>
    </div>
  )
}

/* ─── Advertisement ──────────────────────────────────────────────────────── */
function AdvertisementLayout({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-3" />

        const isHeading = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && !trimmed.startsWith('-') && !trimmed.startsWith('•')
        const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('✓') || trimmed.startsWith('✗')
        const isQuote = trimmed.startsWith('"') && trimmed.endsWith('"')
        const hasKeyValue = /^[A-Za-z]+:/.test(trimmed) && trimmed.indexOf(':') < 20

        if (isHeading) {
          return (
            <p key={i} className="text-sm font-bold text-rose-700 tracking-wide pt-2">
              {trimmed}
            </p>
          )
        }
        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-800 pl-2">
              <span className="text-rose-400 shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed">{trimmed.replace(/^[-•✓✗]\s*/, '')}</span>
            </div>
          )
        }
        if (isQuote) {
          return (
            <p key={i} className="text-sm italic text-gray-500 border-l-2 border-rose-200 pl-3 mt-2">
              {trimmed}
            </p>
          )
        }
        if (hasKeyValue) {
          const colonIdx = trimmed.indexOf(':')
          return (
            <p key={i} className="text-sm text-gray-800 leading-relaxed">
              <span className="font-semibold text-gray-900">{trimmed.slice(0, colonIdx + 1)}</span>
              {trimmed.slice(colonIdx + 1)}
            </p>
          )
        }
        return <p key={i} className="text-sm text-gray-800 leading-relaxed">{trimmed}</p>
      })}
    </div>
  )
}

/* ─── Notice ─────────────────────────────────────────────────────────────── */
function NoticeLayout({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b-2 border-amber-200">
        <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
          <Megaphone className="w-3.5 h-3.5 text-amber-600" />
        </div>
        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Important Notice</span>
      </div>

      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-2.5" />

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')
        const isSignature = /^[A-Z][a-z]+ [A-Z]/.test(trimmed) && trimmed.length < 60 && i > lines.length - 5

        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-800 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
              <span className="leading-[1.8]">{trimmed.replace(/^[•\-*]\s*/, '')}</span>
            </div>
          )
        }
        if (isSignature) {
          return <p key={i} className="text-sm text-gray-600 font-medium mt-2">{trimmed}</p>
        }
        return <p key={i} className="text-sm text-gray-800 leading-[1.8]">{trimmed}</p>
      })}
    </div>
  )
}

/* ─── Form ───────────────────────────────────────────────────────────────── */
function FormLayout({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={i} className="h-2.5" />

        const isSection = trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.endsWith(':')
        const isKeyValue = /^[A-Za-z\s]+:/.test(trimmed) && trimmed.indexOf(':') < 30
        const isBullet = trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')
        const isNumbered = /^\d+\./.test(trimmed)
        const isDivider = trimmed.includes('|') && trimmed.split('|').length >= 2

        if (isSection) {
          return (
            <div key={i} className="pt-3 pb-1">
              <div className="text-xs font-bold text-violet-700 uppercase tracking-wider border-b border-violet-200 pb-1">
                {trimmed.replace(/:$/, '')}
              </div>
            </div>
          )
        }
        if (isDivider) {
          const parts = trimmed.split('|').map(p => p.trim())
          return (
            <div key={i} className="flex flex-wrap gap-3 text-sm py-0.5">
              {parts.map((part, j) => (
                <span key={j} className="text-gray-700">
                  {j > 0 && <span className="text-violet-300 mr-3">|</span>}
                  {part}
                </span>
              ))}
            </div>
          )
        }
        if (isKeyValue && !isBullet && !isNumbered) {
          const colonIdx = trimmed.indexOf(':')
          return (
            <div key={i} className="flex text-sm gap-1 py-0.5">
              <span className="font-medium text-gray-600 shrink-0">{trimmed.slice(0, colonIdx + 1)}</span>
              <span className="text-gray-900">{trimmed.slice(colonIdx + 1).trim()}</span>
            </div>
          )
        }
        if (isBullet) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm pl-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-2" />
              <span className="text-gray-800 leading-relaxed">{trimmed.replace(/^[-•*]\s*/, '')}</span>
            </div>
          )
        }
        if (isNumbered) {
          return (
            <div key={i} className="flex items-start gap-2 text-sm pl-2 py-0.5">
              <span className="text-violet-600 font-semibold shrink-0">{trimmed.match(/^\d+\./)?.[0]}</span>
              <span className="text-gray-800 leading-relaxed">{trimmed.replace(/^\d+\.\s*/, '')}</span>
            </div>
          )
        }
        return <p key={i} className="text-sm text-gray-800 leading-relaxed py-0.5">{trimmed}</p>
      })}
    </div>
  )
}

/* ─── Article ────────────────────────────────────────────────────────────── */
function ArticleLayout({ content }: { content: string }) {
  const paragraphs = content.split('\n\n').filter(Boolean)
  const headline = paragraphs.length > 1 ? paragraphs[0] : null
  const body = headline ? paragraphs.slice(1) : paragraphs

  return (
    <div className="space-y-4">
      {headline && (
        <h2 className="text-lg font-bold text-gray-900 leading-snug border-b border-gray-200 pb-3">
          {headline}
        </h2>
      )}
      {body.map((p, i) => (
        <p
          key={i}
          className={`text-sm leading-[1.9] text-gray-800 ${
            i === 0 && !headline
              ? 'first-letter:text-3xl first-letter:font-bold first-letter:text-gray-900 first-letter:float-left first-letter:mr-2 first-letter:leading-none'
              : ''
          }`}
        >
          {p}
        </p>
      ))}
    </div>
  )
}
