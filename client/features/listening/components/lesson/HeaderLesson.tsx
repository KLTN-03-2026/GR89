import { Headphones } from 'lucide-react'

interface props {
  title: string
  description: string
}

export default function HeaderLesson({ title, description }: props) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-3 rounded-2xl">
        <Headphones className="w-8 h-8 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

