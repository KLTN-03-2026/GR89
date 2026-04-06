/**
 * Bước cuối: hiển thị lỗi (nếu có) và JSON raw từ API (`result.raw`).
 * Hook thường set `result` = `{ raw: response }` hoặc `{ message, raw }` khi lỗi.
 */
'use client'

import type { SheetImportResult } from './types'
import {
  CheckCircle2,
  AlertCircle,
  FileText,
  PlusCircle,
  RefreshCcw,
  SkipForward,
  AlertTriangle,
  Info
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

type SheetImportResultStepProps = {
  result: SheetImportResult
}

export function SheetImportResultStep({ result }: SheetImportResultStepProps) {
  const errors = Array.isArray(result?.errors) ? result.errors : []
  const hasErrors = errors.length > 0

  const total = typeof result?.total === 'number' ? result.total : 0
  const created = typeof result?.created === 'number' ? result.created : 0
  const updated = typeof result?.updated === 'number' ? result.updated : 0
  const skipped = typeof result?.skipped === 'number' ? result.skipped : 0

  const successCount = created + updated
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0
  const errorRate = total > 0 ? Math.round((errors.length / total) * 100) : 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Status Header */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl border ${hasErrors ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
        }`}>
        <div className={`p-2 rounded-full ${hasErrors ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          }`}>
          {hasErrors ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
        </div>
        <div>
          <h3 className={`text-lg font-bold ${hasErrors ? 'text-amber-900' : 'text-emerald-900'
            }`}>
            {hasErrors ? 'Hoàn tất với một số lỗi' : 'Import thành công rực rỡ!'}
          </h3>
          <p className={`text-sm ${hasErrors ? 'text-amber-700' : 'text-emerald-700'
            }`}>
            {result?.message || (hasErrors ? 'Vui lòng kiểm tra lại các dòng bị lỗi.' : 'Tất cả dữ liệu đã được xử lý chính xác.')}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-4 h-4" />}
          label="Tổng cộng"
          value={total}
          color="blue"
        />
        <StatCard
          icon={<PlusCircle className="w-4 h-4" />}
          label="Tạo mới"
          value={created}
          color="emerald"
        />
        <StatCard
          icon={<RefreshCcw className="w-4 h-4" />}
          label="Cập nhật"
          value={updated}
          color="indigo"
        />
        <StatCard
          icon={<SkipForward className="w-4 h-4" />}
          label="Bỏ qua"
          value={skipped}
          color="slate"
        />
      </div>

      {/* Progress Visualization */}
      <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ thành công</p>
            <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Lỗi hệ thống</p>
            <p className="text-2xl font-bold text-red-600">{errors.length}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={successRate} className="h-2 bg-gray-100" />
          <div className="flex justify-between text-[10px] font-medium text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Detailed Errors */}
      {hasErrors && (
        <div className="rounded-2xl border border-red-100 bg-red-50/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-red-100 bg-red-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-bold text-red-900">Chi tiết lỗi ({errors.length})</span>
            </div>
            <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">
              Cần chú ý
            </span>
          </div>
          <div className="max-h-[240px] overflow-auto p-2 space-y-1 custom-scrollbar">
            {errors.map((err, i) => {
              const index = typeof err !== 'string' && typeof err.index === 'number' ? err.index : undefined
              const reason = typeof err === 'string' ? err : typeof err.reason === 'string' ? err.reason : 'Lỗi không xác định'

              return (
                <div key={i} className="group flex gap-3 p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-red-100">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-red-100 flex items-center justify-center text-[10px] font-bold text-red-700">
                    {index !== undefined ? index + 1 : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-red-800 leading-relaxed font-medium">
                      {reason}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          {errors.length > 30 && (
            <div className="px-4 py-2 bg-red-50/50 border-t border-red-100 text-center">
              <p className="text-[10px] text-red-600 font-medium">
                Hiển thị 30 lỗi đầu tiên. Tổng số {errors.length} lỗi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Advice/Next Steps */}
      {!hasErrors && (
        <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">
          <Info className="w-5 h-5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-tight">Mẹo nhỏ</p>
            <p className="text-xs leading-relaxed">
              Bạn có thể xuất file Excel vừa import để lưu trữ hoặc dùng làm mẫu cho lần import sau.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode,
  label: string,
  value: number,
  color: 'blue' | 'emerald' | 'indigo' | 'slate'
}) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100'
  }

  return (
    <div className={`p-4 rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all duration-300 group`}>
      <div className="flex flex-col gap-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
