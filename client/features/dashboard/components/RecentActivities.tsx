import { ArrowRight } from "lucide-react";
import RecentActivitiCard from "./RecentActivitiCard";
import { IRecentActivity, ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export function RecentActivities() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white mb-1">
          ⚡ Hoạt động gần đây
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Những bài học bạn đã hoàn thành</p>
      </div>

      <div className="space-y-3">
        {ROUTES.RECENT_ACTIVITIES.map((activity: IRecentActivity, index: number) => (
          <RecentActivitiCard key={index} {...activity} />
        ))}
      </div>

      <div className="mt-4 text-center">
        <Button variant="link" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium p-0 h-auto text-sm">
          Xem tất cả
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
