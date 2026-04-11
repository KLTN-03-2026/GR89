import { Skeleton } from '@/components/ui/skeleton'

export default function loading() {
  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="rounded-2xl overflow-hidden border border-orange-100">
        <Skeleton className="h-32 w-full rounded-none bg-orange-100" />
        <div className="p-5 bg-white">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
