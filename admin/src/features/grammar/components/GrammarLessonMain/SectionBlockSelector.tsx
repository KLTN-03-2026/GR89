'use client'

import type { SectionBlockKey, SectionBlockOption } from '../../types'

interface SectionBlockSelectorProps {
  availableBlocks: SectionBlockOption[]
  onAddBlock: (blockKey: SectionBlockKey) => void
}

export function SectionBlockSelector({ availableBlocks, onAddBlock }: SectionBlockSelectorProps) {
  if (availableBlocks.length === 0) return null

  return (
    <div className="space-y-3 rounded-xl border border-dashed p-4">
      <div>
        <p className="text-sm font-medium text-slate-900">Thêm block nội dung</p>
        <p className="text-sm text-slate-500">Mỗi loại chỉ thêm một lần và sẽ hiển thị theo thứ tự cố định.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {availableBlocks.map((block) => {
          const Icon = block.icon

          return (
            <button
              key={block.key}
              type="button"
              onClick={() => onAddBlock(block.key)}
              className="rounded-xl border bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">{block.label}</p>
                  <p className="text-xs leading-5 text-slate-500">{block.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

