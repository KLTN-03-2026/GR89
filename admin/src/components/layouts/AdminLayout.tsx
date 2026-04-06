import { SidebarProvider } from '../ui/sidebar'
import { AppSidebar, Header } from '../common'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen max-w-screen overflow-hidden">
        <AppSidebar />

        <div className="flex-1 flex flex-col w-screen overflow-auto">
          <Header />
          <main className="flex-1 overflow-auto bg-white">
            <div className="p-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
