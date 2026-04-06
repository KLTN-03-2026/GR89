import { ReactNode } from "react"

export function AdminPageShell({ children }: { children: ReactNode }) {
  return <div className="p-6 space-y-8 bg-gray-50/30 min-h-screen">{children}</div>
}

