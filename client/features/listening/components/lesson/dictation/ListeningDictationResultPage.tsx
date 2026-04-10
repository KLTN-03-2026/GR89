'use client'

import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'

interface ListeningDictationResultPageProps {
  accuracy: number
  correctCount: number
  totalWords: number
  completedSentenceCount: number
  onRetry: () => void
}

export function ListeningDictationResultPage({
  accuracy,
  correctCount,
  totalWords,
  completedSentenceCount,
  onRetry,
}: ListeningDictationResultPageProps) {
  const tone =
    accuracy >= 80
      ? { title: 'Xuat sac!', subtitle: 'Ban nghe va chep chinh ta rat tot.', color: 'text-emerald-600' }
      : accuracy >= 50
        ? { title: 'Kha tot!', subtitle: 'Ban dang tien bo ro ret, tiep tuc phat huy.', color: 'text-amber-600' }
        : { title: 'Co gang them!', subtitle: 'Lam lai mot luot nua de cai thien do chinh xac.', color: 'text-rose-600' }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Ket qua chep chinh ta</h3>
              <p className="text-indigo-100 mt-1">Tong ket phan luyen nghe cua ban</p>
            </div>
            {accuracy >= 80 && (
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-200" />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4">
              <p className={`text-xl font-bold ${tone.color}`}>{tone.title}</p>
              <p className="text-sm text-gray-600 mt-1">{tone.subtitle}</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">So tu dung</span>
                <span className="font-semibold text-indigo-600">{correctCount}/{totalWords}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Ty le chinh xac</span>
                <span className="font-semibold text-indigo-600">{accuracy}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">
                Tien do cau hoan thanh
              </p>
              <p className="text-sm text-gray-600">
                Ban da hoan thanh <span className="font-semibold text-indigo-600">{completedSentenceCount}</span> cau.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <svg viewBox="0 0 36 36" className="w-40 h-40">
                <path className="text-gray-200" stroke="currentColor" strokeWidth="4" fill="none" d="M18 2a16 16 0 110 32 16 16 0 010-32z" />
                <path
                  className="text-indigo-600"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.max(0, Math.min(100, accuracy))}, 100`}
                  d="M18 2a16 16 0 110 32 16 16 0 010-32z"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-700">{accuracy}%</div>
                  <div className="text-xs text-gray-500">Do chinh xac</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button onClick={onRetry} className="w-full sm:w-auto">
            Lam lai
          </Button>
        </div>
      </div>
    </div>
  )
}

