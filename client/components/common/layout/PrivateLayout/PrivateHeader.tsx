'use client'
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants/routes";
import { usePathname } from "next/navigation";

export function PrivateHeader() {
  const pathname = usePathname()

  const ROUTES_NAME_GROUP = () => {
    const pathnameArray = pathname.split('/')
    const pathnameGroup = pathnameArray.slice(0, 3).join('/')
    return pathnameGroup
  }

  return (
    <header className="sticky top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="px-4 h-12 flex items-center gap-3">
        <SidebarTrigger />
        <span className="text-sm font-medium text-gray-700">
          {ROUTES.ROUTES_NAME[ROUTES_NAME_GROUP() as keyof typeof ROUTES.ROUTES_NAME]}
        </span>
      </div>
    </header>
  )
}
