'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Eye, Loader2, Send } from 'lucide-react'
import { toast } from 'react-toastify'
import { IHomework, ISubmission } from '../../../type'
import { useRouter } from 'next/navigation'
import { RichEditor } from '@/components/common/editor/RichEditor'
import { gradeHomework } from '../../../services/api'

interface HomeworkSubmissionActionsCellProps {
  homeworkId: IHomework['_id']
  submission?: ISubmission | null
}

export function HomeworkSubmissionActionsCell({ homeworkId, submission }: HomeworkSubmissionActionsCellProps) {
  const router = useRouter()
  const [openView, setOpenView] = useState(false)
  const [openGrade, setOpenGrade] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [correctedContent, setCorrectedContent] = useState('')

  useEffect(() => {
    setFeedback(submission?.feedback || '')
    setCorrectedContent(submission?.content || '')
  }, [submission])

  const user = submission?.user
  const userId = typeof user === 'string' ? user : user?._id
  const userName = typeof user === 'object' && user?.fullName ? user.fullName : 'Học viên'
  const userEmail = typeof user === 'object' && user?.email ? user.email : ''

  if (!submission) return null
  const htmlContent = submission.content || ''

  const toPlain = (html: string) => {
    return String(html || '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/&nbsp;/g, ' ')
      .trim()
  }

  const handleSave = async () => {
    if (!userId) {
      toast.error('Không xác định được học viên')
      return
    }

    const hasFeedback = toPlain(feedback).length > 0
    const hasCorrected = toPlain(correctedContent).length > 0
    if (!hasFeedback && !hasCorrected) {
      toast.error('Vui lòng nhập nhận xét hoặc chỉnh sửa bài làm')
      return
    }

    setIsSaving(true)
    try {
      const res = await gradeHomework(homeworkId, {
        userId,
        feedback,
        correctedContent
      })
      if (res.success) {
        toast.success(submission.status === 'graded' ? 'Đã cập nhật nhận xét' : 'Đã chấm bài')
        router.refresh()
        setOpenGrade(false)
      } else {
        toast.error(res.message || 'Không thể chấm bài lúc này')
      }
    } catch {
      toast.error('Không thể chấm bài lúc này')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex gap-2 pt-2 border-t border-gray-50">
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50 h-10 font-bold text-xs"
          >
            <Eye className="w-4 h-4 mr-2" /> Xem bài làm
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 border-b border-gray-100">
            <DialogTitle className="text-2xl font-black text-gray-900">Bài làm: {userName}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-8 md:p-12 prose prose-blue max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-lg">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100">
            <Button variant="outline" className="rounded-xl px-8" onClick={() => setOpenView(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openGrade}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpenGrade(true)} className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl h-10 font-bold text-xs">
            <Send className="w-4 h-4 mr-2" /> {submission.status === 'graded' ? 'Cập nhật nhận xét' : 'Chấm bài'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
          <DialogHeader className="p-8 pb-4 border-b border-gray-100">
            <DialogTitle className="text-2xl font-black text-gray-900">
              {submission.status === 'graded' ? 'Cập nhật nhận xét' : 'Chấm bài'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Học viên</div>
                <div className="font-black text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500 font-medium">{userEmail}</div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Bài làm (có thể chỉnh sửa)</div>
                <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                  <RichEditor
                    value={correctedContent}
                    onChange={setCorrectedContent}
                    className="min-h-64 max-h-96"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Nhận xét</div>
                <Textarea
                  className="min-h-32 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium p-6 resize-none"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isSaving}
                  placeholder="Nhập nhận xét..."
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 bg-gray-50/50 border-t border-gray-100 gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl px-8" onClick={() => setOpenGrade(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
