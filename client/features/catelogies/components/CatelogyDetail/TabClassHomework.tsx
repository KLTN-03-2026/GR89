'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabsContent } from '@/components/ui/tabs'
import UploadHomeworkSheet from '@/features/catelogies/components/Dialogs/UploadHomeworkSheet'
import { getHomeworkSubmissions, submitHomework } from '@/features/catelogies/services/api'
import { IDocument, IHomework, IHomeworkSubmission } from '@/features/catelogies/types'
import { formatDateOnly } from '@/libs/utils'
import { CheckCircle2, Clock, Eye, FileText, Link, Upload } from 'lucide-react'
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
  const [openSubmission, setOpenSubmission] = useState(false)
  const [viewHomework, setViewHomework] = useState<IHomework | null>(null)
  const [submittedHtml, setSubmittedHtml] = useState('')
  const [correctedHtml, setCorrectedHtml] = useState('')
  const [commentHtml, setCommentHtml] = useState('')
  const [activeViewTab, setActiveViewTab] = useState<'submitted' | 'corrected'>('submitted')
  const [submissionHistory, setSubmissionHistory] = useState<IHomeworkSubmission[]>([])
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>('')
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

  const stripText = (html: string) => String(html || '').replace(/<[^>]*>?/gm, '').trim()

  const sortBySubmittedAtDesc = (items: IHomeworkSubmission[]) => {
    return [...(items || [])].sort((a, b) => {
      const at = a?.submittedAt ? new Date(a.submittedAt).getTime() : 0
      const bt = b?.submittedAt ? new Date(b.submittedAt).getTime() : 0
      return bt - at
    })
  }


  const applySelectedSubmission = (sub: IHomeworkSubmission) => {
    const submissionContent = sub?.content || ''
    setSubmittedHtml(submissionContent)

    const corrected = sub?.correctedContent || ''
    const comment = sub?.comment || ''
    setCorrectedHtml(corrected)

    setCommentHtml(comment)

    if (stripText(corrected).length > 0 || stripText(comment).length > 0) {
      setActiveViewTab('corrected')
    } else {
      setActiveViewTab('submitted')
    }
  }

  const handleOpenViewSubmission = async (hw: IHomework) => {
    setViewHomework(hw)
    setOpenSubmission(true)
    setActiveViewTab('submitted')
    setSubmittedHtml('')
    setCorrectedHtml('')
    setCommentHtml('')
    setSubmissionHistory([])
    setSelectedSubmissionId('')

    setIsLoading(true)
    try {
      const latestLocal = (hw?.submissions || []).reduce((acc: IHomeworkSubmission, cur: IHomeworkSubmission) => {
        const accTime = acc?.submittedAt ? new Date(acc.submittedAt).getTime() : 0
        const curTime = cur?.submittedAt ? new Date(cur.submittedAt).getTime() : 0
        return curTime >= accTime ? cur : acc
      }, (hw?.submissions || [])[0])

      let history = sortBySubmittedAtDesc(hw?.submissions || [])

      const submissionRes = await getHomeworkSubmissions(hw._id)
      const latestFromApi =
        submissionRes?.data ??
        submissionRes?.submission ??
        submissionRes?.data?.submission ??
        submissionRes

      if (latestFromApi?._id) {
        const idx = history.findIndex((s) => String(s?._id) === String(latestFromApi._id))
        if (idx >= 0) history[idx] = { ...history[idx], ...latestFromApi }
        else history = sortBySubmittedAtDesc([latestFromApi, ...history])
      } else if (!history.length && latestFromApi) {
        history = [latestFromApi]
      }

      history = sortBySubmittedAtDesc(history)
      setSubmissionHistory(history)

      const first = history[0] || latestLocal || null
      const firstId = first?._id ? String(first._id) : '0'
      setSelectedSubmissionId(firstId)
      applySelectedSubmission(first)
    } catch {
      toast.error('Không thể tải bài nộp lúc này')
    } finally {
      setIsLoading(false)
    }
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
                  <p className="font-bold text-gray-900">
                    {hw.submissions?.length ? 'Bài làm của bạn' : 'Nộp bài làm của bạn'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOCX hoặc hình ảnh</p>
                </div>

                {hw.submissions?.length ? (
                  <Button
                    variant="outline"
                    onClick={() => handleOpenViewSubmission(hw)}
                    disabled={isLoading}
                    className="w-full rounded-xl font-bold border-gray-200 text-gray-700 hover:bg-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Xem bài đã nộp
                  </Button>
                ) : null}

                <Button 
                  onClick={() => {
                    setCurrentHomework(hw)
                    setIsOpen(true)
                  }}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold"
                >
                  {hw.submissions?.length ? 'Nộp lại' : 'Nộp bài tập'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={openSubmission}
        onOpenChange={(next) => {
          setOpenSubmission(next)
          if (!next) {
            setViewHomework(null)
            setSubmittedHtml('')
            setCorrectedHtml('')
            setCommentHtml('')
            setActiveViewTab('submitted')
            setSubmissionHistory([])
            setSelectedSubmissionId('')
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 border-b border-gray-100">
            <DialogTitle className="text-2xl font-black text-gray-900">
              {viewHomework?.title || 'Bài nộp'}
            </DialogTitle>
          </DialogHeader>

          <div className="px-8 pt-6 shrink-0">
            <Tabs value={activeViewTab} onValueChange={(v) => setActiveViewTab(v as 'submitted' | 'corrected')}>
              <TabsList className="rounded-2xl">
                <TabsTrigger value="submitted" className="rounded-xl font-bold">
                  Bài đã nộp
                </TabsTrigger>
                <TabsTrigger
                  value="corrected"
                  className="rounded-xl font-bold"
                  disabled={!!stripText(correctedHtml) && !!stripText(commentHtml)}
                >
                  Bài đã sửa
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {submissionHistory.length > 1 ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Lịch sử nộp</div>
                <select
                  className="h-10 rounded-2xl border border-gray-100 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={selectedSubmissionId}
                  onChange={(e) => {
                    const nextId = e.target.value
                    setSelectedSubmissionId(nextId)
                    const picked = submissionHistory.find((s, idx) => String(s?._id ?? idx) === String(nextId))
                    applySelectedSubmission(picked as IHomeworkSubmission)
                  }}
                  disabled={isLoading}
                >
                  {submissionHistory.map((s, idx) => {
                    const formatDate = (date?: string) =>
                    date ? new Date(date).toLocaleString('vi-VN') : 'Không rõ thời gian'

                    const label =
                      idx === 0
                        ? `Mới nhất • ${formatDate(s?.submittedAt)}`
                        : `Lần ${submissionHistory.length - idx} • ${formatDate(s?.submittedAt)}`
                    return (
                      <option key={String(s?._id ?? idx)} value={String(s?._id ?? idx)}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </div>
            ) : null}
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-8 pt-6 space-y-6">
              {activeViewTab === 'submitted' ? (
                <div className="prose prose-blue max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-lg">
                  <div dangerouslySetInnerHTML={{ __html: submittedHtml || '<p>Chưa có bài nộp.</p>' }} />
                </div>
              ) : (
                <div className="space-y-6">
                  {stripText(commentHtml).length > 0 ? (
                    <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-6">
                      <div className="text-xs font-black text-amber-600 uppercase tracking-widest mb-3">Nhận xét</div>
                      <div className="prose prose-blue max-w-none prose-p:text-gray-700 prose-p:leading-relaxed">
                        <div dangerouslySetInnerHTML={{ __html: commentHtml }} />
                      </div>
                    </div>
                  ) : null}
                  <div className="rounded-3xl border border-gray-100 bg-white p-6">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Bài đã sửa</div>
                    <div className="prose prose-blue max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-lg">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: correctedHtml || '<p>Giáo viên chưa sửa bài.</p>',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UploadHomeworkSheet 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={onSubmit}
        currentHomework={currentHomework}
      />
    </TabsContent>
  )
}
