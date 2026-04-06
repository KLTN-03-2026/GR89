import { IQuickAction } from '@/constants/routes'
import Link from 'next/link'

export default function QuickActionCard({ title, description, href }: IQuickAction) {
  return (
    <Link href={href}>
      <div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer group">
        <div className="flex items-center gap-3">
          <span className="text-sm">📚</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950 px-2 py-1 rounded-md">
            {description}
          </span>
        </div>
      </div>
    </Link>
  )
}
