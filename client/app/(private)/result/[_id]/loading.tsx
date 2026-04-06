import { Loader2 } from 'lucide-react'

export default function loading() {
  return (
    <div className="flex justify-center items-center h-full min-h-[400px]">
      <Loader2 className="animate-spin w-8 h-8 text-primary" />
    </div>
  )
}

