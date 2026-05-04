'use client'

import { Button } from '@/components/ui/button'
import { TabsContent } from '@/components/ui/tabs'
import UploadHomeworkSheet from '@/features/catelogies/components/Dialogs/UploadHomeworkSheet'
import { submitHomework } from '@/features/catelogies/services/api'
import { IDocument, IHomework } from '@/features/catelogies/types'
import { formatDateOnly } from '@/libs/utils'
import { CheckCircle2, Clock, FileText, Link, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface Props {
  homeworks: IHomework[]
  onView: (homework: IDocument) => void
}
export default function TabClassHomework({ homeworks, onView }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentHomework, setCurrentHomework] = useState<IHomework>()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (content: string) => {
    setIsLoading(true)
    await submitHomework(currentHomework!._id, content)
      .then(() => {
        router.refresh()
        toast.success('Nộp bài tập thành công')
        setIsOpen(false)
      })
    .finally(() => {
      setIsLoading(false)
    })
  }
  
  return (
    <TabsContent value="homeworks" className="space-y-6">
      {homeworks.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gray-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài tập về nhà</h3>
          <p className="text-gray-500">Khi có bài tập mới, hệ thống sẽ hiển thị ở đây.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {homeworks.map((hw, index) => (
            <div
              key={hw._id ? `homework-${hw._id}` : `homework-${index}`}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              <div className="flex-1 p-8 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {hw.deadline ? (
                      <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase">
                        <Clock className="w-3.5 h-3.5" />
                        Hạn chót: {formatDateOnly(hw.deadline)}
                      </div>
                    ) : null}
                    <h3 className="text-xl font-bold text-gray-900">{hw.title}</h3>
                  </div>
                  {/* <Badge variant={hw.isSubmitted ? "outline" : "default"} className={hw.isSubmitted ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "bg-orange-500"}>
                    {hw.isSubmitted ? "Đã nộp bài" : "Chưa nộp"}
                  </Badge> */}
                </div>
                <p className="text-gray-500 leading-relaxed">Mô tả: {' ' + hw.description}</p>
                <p className="mt-6 text-gray-500 leading-relaxed flex gap-1 items-center text-md"><Link className="w-4 h-4"/> Tài liệu đính kèm</p>
                <div className="flex flex-wrap items-center gap-2">
                  {hw.documents.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {hw.documents.map((doc: IDocument, docIndex: number) => (
                          <Button
                            key={doc?._id ? `hw-doc-${doc._id}` : `hw-doc-${index}-${docIndex}`}
                            size="sm"
                            className="font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-800 bg-white border border-gray-100"
                            onClick={() => {
                              onView({
                                ...doc,
                                name: doc?.name  ?? `Tài liệu ${docIndex + 2}`,
                                content: doc?.content ?? '',
                              })
                            }}
                          >
                            <FileText /> {doc.name}
                          </Button>
                        ))}
                      </div>
                    ) : (
                    <Button variant="outline" size="sm" disabled>
                      Chưa có tài liệu đính kèm
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-8 flex flex-col items-center justify-center border-l border-gray-100 w-full md:w-80 gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-gray-400">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900">Nộp bài làm của bạn</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOCX hoặc hình ảnh</p>
                </div>
                <Button 
                  onClick={() => {
                    setCurrentHomework(hw)
                    setIsOpen(true)
                  }}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold"
                >
                  Nộp bài tập
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadHomeworkSheet 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={onSubmit}
        currentHomework={currentHomework}
      />
    </TabsContent>
  )
}
