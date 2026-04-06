'use client'
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, PrivateHeader } from "@/components/common/layout";
import { AIChatButton, ChatProvider } from '@/features/chat'

export function PrivateLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <ChatProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <PrivateHeader />
            <main className="flex-1 overflow-auto bg-white">
              <div className="p-4">
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Floating Chat Buttons - Always visible in private area */}
        <AIChatButton />
      </ChatProvider>
    </SidebarProvider>
  )
}
