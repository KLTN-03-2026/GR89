'use client'
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, PrivateHeader } from "@/components/common/layout";
import { AIChatButton, ChatProvider, HumanChatButton } from '@/features/chat'
import { ZaloContract } from "@/features/chat/components/chatZalo/ZaloContract";
import { FacebookContact } from "@/features/chat/components/chatFacebook/FacebookContact";

export function PrivateLayout({ children }: { children: React.ReactNode }) {

  return (
    <SidebarProvider>
      <ChatProvider>
        <div className="flex h-screen w-full" suppressHydrationWarning>
          <AppSidebar />
          <div className="flex-1 flex flex-col" suppressHydrationWarning>
            <PrivateHeader />
            <main className="flex-1 overflow-auto bg-white">
              <div className="p-4" suppressHydrationWarning>
                {children}
              </div>
            </main>
          </div>
        </div>

        {/* Floating Chat Buttons - Always visible in private area */}
        <div className="fixed bottom-4 right-6 z-50 flex flex-col items-end gap-4">
          <FacebookContact floating={false} />
          <ZaloContract floating={false} />
          <HumanChatButton floating={false} />
          <AIChatButton floating={false} />
        </div>
      </ChatProvider>
    </SidebarProvider>
  )
}
