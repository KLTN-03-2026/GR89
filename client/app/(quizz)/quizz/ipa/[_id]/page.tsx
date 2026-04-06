import Link from 'next/link'
import { ArrowLeft, Volume2 } from 'lucide-react'
import { fetchServer } from '@/libs/apis/fetch-server'
import { IIpa, QuizzIPA } from '@/features/ipa'

export default async function page({ params }: { params: Promise<{ _id: string }> }) {
  const { _id } = await params

  const ipa = await fetchServer<IIpa>(`/ipa/user/${_id}`)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Polished breadcrumb header */}
      <div className="bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/study/ipa" className="inline-flex items-center gap-2 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800">Quiz IPA</span>
          </div>
        </div>
      </div>

      {/* Page header */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Bài kiểm tra IPA</h1>
            <p className="text-sm text-gray-600 mt-1">Kiểm tra nhanh kiến thức phiên âm và cách phát âm.</p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md">
            <Volume2 className="w-4 h-4" /> IPA
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl px-4 pb-10">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <QuizzIPA ipa={ipa} />
        </div>
      </div>
    </div>
  )
}
