import { IRecentActivity } from '@/constants/routes'

export default function RecentActivitiCard({ title, subtitle, time, Icon, color }: IRecentActivity) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-gradient-to-br ${color} rounded-lg text-white flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{time}</p>
    </div>
  )
}
