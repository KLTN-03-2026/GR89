import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Headphones, Users, Eye, TrendingUp } from "lucide-react"

export function ListeningStatsSkeleton() {
  const skeletonStats = [
    { icon: Headphones },
    { icon: Users },
    { icon: Eye },
    { icon: TrendingUp }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {skeletonStats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
