import { Skeleton } from '@/components/ui/skeleton'

export default function VocabularyLearnLoading() {
  return (
    <>
      {/* Header "Quay lại danh sách từ" */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded bg-gray-200" />
        <Skeleton className="h-5 w-40 rounded bg-gray-200" />
      </div>

      <div className="max-w-5xl m-auto">
        {/* Card tiêu đề + progress */}
        <div className="my-5 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="p-6 pb-3 space-y-2">
            <Skeleton className="h-8 w-28 rounded bg-gray-200" />
            <Skeleton className="h-4 w-44 rounded bg-gray-200" />
          </div>
          <div className="px-6 pb-6 space-y-2">
            <Skeleton className="h-2.5 w-full rounded-full bg-gray-200" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24 rounded bg-gray-200" />
              <Skeleton className="h-4 w-32 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Flashcard skeleton */}
        <div className="relative mb-8">
          <div className="w-full min-h-[540px] rounded-xl bg-primary shadow-2xl flex flex-col items-center justify-center p-6 text-white">
            <div className="w-full max-w-xl">
              {/* Ảnh minh họa + ring + gradient overlay */}
              <div className="relative rounded-2xl overflow-hidden ring-4 ring-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                <Skeleton className="w-full h-[300px] rounded-2xl bg-white/15" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
              </div>

              {/* Từ vựng lớn + phiên âm + loại từ + hint */}
              <div className="text-center mt-6 space-y-3">
                <Skeleton className="h-14 w-52 mx-auto rounded-lg bg-white/20" />
                <Skeleton className="h-5 w-32 mx-auto rounded bg-white/15" />
                <Skeleton className="h-6 w-20 mx-auto rounded-full bg-white/10" />
                <Skeleton className="h-5 w-48 mx-auto rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className="flex justify-between items-center gap-4">
          <Skeleton className="h-10 w-24 rounded-md bg-gray-200" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-28 rounded-md bg-gray-200" />
            <Skeleton className="h-10 w-28 rounded-md bg-gray-200" />
          </div>
          <Skeleton className="h-10 w-24 rounded-md bg-gray-200" />
        </div>
      </div>
    </>
  )
}
