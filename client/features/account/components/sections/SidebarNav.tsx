'use client'
import { Card, CardContent } from '@/components/ui/card'

interface TabItem {
  id: string
  label: string
  description: string
  icon: React.ElementType
}

interface SidebarNavProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (id: string) => void
}

export default function SidebarNav({ tabs, activeTab, onChange }: SidebarNavProps) {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl lg:sticky lg:top-20">
      <CardContent className="p-0">
        <nav className="flex lg:block gap-2 overflow-x-auto no-scrollbar px-2 lg:px-0 py-2 lg:py-0">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex-shrink-0 lg:w-full h-14 lg:h-16 flex items-center gap-3 px-4 lg:px-5 text-left transition-all duration-200 rounded-lg ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 ring-1 ring-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <IconComponent className="w-5 h-5" />
                <div className="leading-tight">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}


