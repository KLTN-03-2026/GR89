import { Footer, MainHeader } from "@/components/common/layout";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <MainHeader />
      {children}
      <Footer />
    </div>
  )
}
