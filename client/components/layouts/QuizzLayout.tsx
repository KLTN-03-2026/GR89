export function QuizzLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="w-full max-h-screen h-screen bg-primary/10 overflow-auto">
      {children}
    </div>
  )
}
