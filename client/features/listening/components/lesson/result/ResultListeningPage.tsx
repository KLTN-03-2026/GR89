'use client'
import { formatDate, getTime } from "@/libs/utils"
import { IListeningProgress } from "@/features/listening/types"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Trophy, Target, RefreshCcw, ListMusic } from "lucide-react"

interface ResultListeningPageProps {
  result: IListeningProgress
  onRetry?: () => void
}

export function ResultListening({ result, onRetry }: ResultListeningPageProps) {
  const router = useRouter()
  const [showSubtitleVi, setShowSubtitleVi] = useState(false)
  const subtitleVi = result.listeningId.subtitleVi || ''
  const linesVi = subtitleVi.split('\n').map(line => line.trim()).filter(Boolean);

  // Extract speaker names from the original subtitleEn
  const originalLines = String(result.listeningId.subtitle || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const speakerNames = originalLines.map(line => {
    const match = line.match(/^([A-Za-z0-9\s]+)\s*:/i);
    return match ? match[1] : null;
  });

  const diffResult = result.result || [];

  // Calculate total missing/wrong words (just for displaying the number)
  const wrongsCount = diffResult.reduce((acc, part) => {
    if (part?.added || part?.removed) {
      return acc + (part?.value || '').trim().split(/[ \t\n]+/).filter(Boolean).length;
    }
    return acc;
  }, 0);

  const totalAnswers = result.totalQuestions ?? 0
  const wpm = result.time > 0 ? (totalAnswers / result.time) * 60 : 0

  // Format the diff result into lines for rendering
  const diffLines: { value: string, added?: boolean, removed?: boolean }[][] = [];
  let currentLineParts: { value: string, added?: boolean, removed?: boolean }[] = [];

  diffResult.forEach(part => {
    const value = part?.value || '';
    const subParts = value.split('\n');
    subParts.forEach((subPart: string, index: number) => {
      if (index > 0) {
        diffLines.push(currentLineParts);
        currentLineParts = [];
      }
      if (subPart) {
        currentLineParts.push({ ...part, value: subPart });
      }
    });
  });
  if (currentLineParts.length > 0 || diffLines.length === 0) {
    diffLines.push(currentLineParts);
  }

  const tone =
    result.progress >= 80
      ? { title: 'Xuất sắc!', color: 'text-emerald-600', sub: 'Bạn đã nghe và chép rất chính xác.' }
      : result.progress >= 50
        ? { title: 'Khá tốt!', color: 'text-amber-600', sub: 'Bạn đang tiến bộ, hãy luyện thêm để tăng độ chính xác.' }
        : { title: 'Cố gắng thêm!', color: 'text-rose-600', sub: 'Làm lại bài và tập trung vào các từ sai bên dưới.' }

  const handleRetry = () => {
    if (!onRetry) {
      router.replace(`/skills/listening/${result.listeningId._id}`)
    }
    else {
      onRetry()
    }
  }
  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md mb-2">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>Hoàn thành bài học</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{tone.title}</h1>
            <p className="text-indigo-100 max-w-md text-lg">{tone.sub}</p>
            <p className="text-sm font-medium text-white/80 pt-2 border-t border-white/20 inline-block">Chủ đề: {result.listeningId.title}</p>
          </div>

          <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-inner">
            <div className="text-sm font-medium text-indigo-100 mb-1">Độ chính xác</div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black">{Math.round(result.progress)}</span>
              <span className="text-2xl font-bold text-indigo-200">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Điểm Quiz', value: `${result.quizPoint ?? 0}/${result.quizTotal ?? 0}`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Từ đúng', value: `${result.point}/${totalAnswers}`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Từ sai/thiếu', value: `${wrongsCount}`, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Thời gian', value: getTime(result.time), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' }
        ].map((s, i) => (
          <div key={i} className="group relative overflow-hidden rounded-2xl bg-white p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${s.bg} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative z-10 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{s.value}</div>
                <div className="text-sm font-medium text-gray-500 mt-0.5">{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diff Result Section */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                  <ListMusic className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Đoạn hội thoại đã chấm điểm</h2>
                  <p className="text-sm text-gray-500 font-medium">Chi tiết lỗi sai từng câu</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubtitleVi(!showSubtitleVi)}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
              >
                {showSubtitleVi ? 'Ẩn tiếng Việt' : 'Xem tiếng Việt'}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {diffLines.map((lineParts, index) => {
                if (lineParts.length === 0 && !linesVi[index]) return null;
                const speaker = speakerNames[index];
                return (
                  <div key={index} className="space-y-0.5 rounded-xl hover:bg-gray-50/50 transition-colors">
                    <div className="text-gray-800 leading-relaxed text-base flex items-start">
                      {speaker && (
                        <span className="font-bold text-indigo-700 mr-2 flex-shrink-0">{speaker}:</span>
                      )}
                      <div className="flex-1">
                        {lineParts.map((part, i) => {
                          if (part.added) {
                            return (
                              <span key={i} className="bg-red-100 text-red-700 line-through mx-0.5 px-1 py-0.5 rounded-md">
                                {part.value}
                              </span>
                            );
                          }
                          if (part.removed) {
                            return (
                              <span key={i} className="bg-amber-100 text-amber-800 mx-0.5 px-1 py-0.5 rounded-md" title="Từ này bạn gõ thiếu hoặc sai">
                                {part.value}
                              </span>
                            );
                          }
                          return (
                            <span key={i} className="text-gray-800">
                              {part.value}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {showSubtitleVi && linesVi[index] && (
                      <p className={`text-gray-500 text-sm leading-snug mt-0.5 ${speaker ? 'ml-1' : ''}`}>{linesVi[index]}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Actions & Info Section */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Thông tin thêm</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <span className="text-gray-600 font-medium">Tốc độ gõ</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-800">{Math.round(wpm)}</span>
                  <span className="text-sm font-medium text-gray-500">WPM</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <span className="text-gray-600 font-medium">Ngày hoàn thành</span>
                <span className="font-bold text-gray-800">{formatDate(result.date)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                onClick={handleRetry}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" />
                Làm lại
              </Button>
              <Link href="/skills/listening" className="block w-full">
                <Button variant="outline" className="w-full h-12 rounded-xl font-semibold text-base border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <ListMusic className="w-5 h-5" />
                  Danh sách bài nghe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
