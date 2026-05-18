 'use client'
 
 import { Button } from '@/components/ui/button'
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
 import { ScrollArea } from '@/components/ui/scroll-area'
 import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
 import { Activity, CheckCircle2, FileText, MessageSquareText, NotebookPen, X } from 'lucide-react'
 import { useMemo } from 'react'
 
 export type HomeworkViewTab = 'submitted' | 'corrected'
 
 export interface HomeworkSubmissionHistoryItem {
   _id?: string
   submittedAt?: string
 }
 
 interface HomeworkSubmissionDialogProps {
   isOpen: boolean
   onOpenChange: (next: boolean) => void
   title: string
   isLoading: boolean
 
   activeTab: HomeworkViewTab
   onTabChange: (tab: HomeworkViewTab) => void
 
   submissionHistory: HomeworkSubmissionHistoryItem[]
   selectedSubmissionId: string
   onSelectSubmissionId: (nextId: string) => void
 
   submittedHtml: string
   correctedHtml: string
   commentHtml: string
 }
 
 const stripText = (html: string) => String(html || '').replace(/<[^>]*>?/gm, '').trim()
 
 const formatDateTime = (date?: string) => (date ? new Date(date).toLocaleString('vi-VN') : 'Không rõ thời gian')
 
 export function HomeworkSubmissionDialog({
   isOpen,
   onOpenChange,
   title,
   isLoading,
   activeTab,
   onTabChange,
   submissionHistory,
   selectedSubmissionId,
   onSelectSubmissionId,
   submittedHtml,
   correctedHtml,
   commentHtml,
 }: HomeworkSubmissionDialogProps) {
   const hasCorrection = useMemo(() => {
     return stripText(correctedHtml).length > 0 || stripText(commentHtml).length > 0
   }, [correctedHtml, commentHtml])
 
   const latestSubmittedAt = useMemo(() => {
     const first = submissionHistory?.[0]
     return first?.submittedAt
   }, [submissionHistory])
 
   return (
     <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-6xl h-[88vh] overflow-hidden flex flex-col rounded-3xl p-0 border-none shadow-2xl">
         <DialogHeader className="p-6 md:p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
           <div className="flex items-start justify-between gap-6 pr-10">
             <div className="space-y-1.5 min-w-0">
               <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-100/90">
                 <NotebookPen className="h-4 w-4" />
                 Bài nộp của bạn
               </div>
               <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight truncate">
                 {title || 'Bài nộp'}
               </DialogTitle>
               <div className="text-xs md:text-sm text-blue-100/85 font-medium">
                 {latestSubmittedAt ? `Cập nhật • ${formatDateTime(latestSubmittedAt)}` : 'Cập nhật • —'}
               </div>
             </div>
 
             <div className="hidden md:flex items-center gap-2">
               <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-md border border-white/15">
                 <Activity className="h-4 w-4 text-blue-100" />
                 <span className="text-xs font-black text-white">
                   {submissionHistory?.length || 0} lần nộp
                 </span>
               </div>
               {hasCorrection ? (
                 <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400/15 px-3 py-2 backdrop-blur-md border border-emerald-300/20">
                   <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                   <span className="text-xs font-black text-emerald-100">Đã chấm</span>
                 </div>
               ) : (
                 <div className="inline-flex items-center gap-2 rounded-2xl bg-amber-400/15 px-3 py-2 backdrop-blur-md border border-amber-300/20">
                   <FileText className="h-4 w-4 text-amber-200" />
                   <span className="text-xs font-black text-amber-100">Chờ chấm</span>
                 </div>
               )}
             </div>
           </div>
 
           <Button
             variant="ghost"
             size="icon"
             className="absolute top-4 right-4 text-white hover:bg-white/15"
             onClick={() => onOpenChange(false)}
           >
             <X className="w-5 h-5" />
           </Button>
         </DialogHeader>
 
         <div className="px-6 md:px-8 py-4 border-b border-gray-100 bg-white shrink-0">
           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
             <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as HomeworkViewTab)}>
               <TabsList className="rounded-2xl bg-gray-50 border border-gray-100 p-1">
                 <TabsTrigger value="submitted" className="rounded-xl font-black">
                   Bài đã nộp
                 </TabsTrigger>
                 <TabsTrigger value="corrected" disabled={!hasCorrection} className="rounded-xl font-black">
                   Bài đã chấm
                 </TabsTrigger>
               </TabsList>
             </Tabs>
 
             {submissionHistory.length > 1 ? (
               <div className="flex items-center gap-3">
                 <div className="hidden sm:block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                   Lịch sử nộp
                 </div>
                 <select
                   className="h-11 w-full md:w-auto rounded-2xl border border-gray-100 bg-white px-4 text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                   value={selectedSubmissionId}
                   onChange={(e) => onSelectSubmissionId(e.target.value)}
                   disabled={isLoading}
                 >
                   {submissionHistory.map((s, idx) => {
                     const label =
                       idx === 0
                         ? `Mới nhất • ${formatDateTime(s?.submittedAt)}`
                         : `Lần ${submissionHistory.length - idx} • ${formatDateTime(s?.submittedAt)}`
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
         </div>
 
         <ScrollArea className="flex-1 min-h-0 bg-gray-50/50">
           <div className="p-6 md:p-8">
             <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
               <div className="space-y-6 min-w-0">
                 {activeTab === 'submitted' ? (
                   <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                     <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                       <FileText className="h-4 w-4" />
                       Bài đã nộp
                     </div>
                     <div className="prose prose-blue max-w-none prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-lg">
                       <div dangerouslySetInnerHTML={{ __html: submittedHtml || '<p>Chưa có bài nộp.</p>' }} />
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {stripText(commentHtml).length > 0 ? (
                       <div className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6 shadow-sm">
                         <div className="flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-widest mb-4">
                           <MessageSquareText className="h-4 w-4" />
                           Nhận xét
                         </div>
                         <div className="prose prose-blue max-w-none prose-p:text-gray-700 prose-p:leading-relaxed">
                           <div dangerouslySetInnerHTML={{ __html: commentHtml }} />
                         </div>
                       </div>
                     ) : null}
 
                     <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
                       <div className="flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-widest mb-4">
                         <CheckCircle2 className="h-4 w-4" />
                         Bài đã chấm
                       </div>
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
 
               <div className="lg:sticky lg:top-6 h-fit space-y-4">
                 <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                   <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                     Tóm tắt
                   </div>
                   <div className="space-y-3">
                     <div className="flex items-start justify-between gap-3">
                       <div className="text-xs font-bold text-gray-500">Số lần nộp</div>
                       <div className="text-sm font-black text-gray-900">{submissionHistory?.length || 0}</div>
                     </div>
                     <div className="flex items-start justify-between gap-3">
                       <div className="text-xs font-bold text-gray-500">Trạng thái</div>
                       <div className={hasCorrection ? "text-xs font-black text-emerald-700" : "text-xs font-black text-amber-700"}>
                         {hasCorrection ? "Đã chấm" : "Chờ chấm"}
                       </div>
                     </div>
                     <div className="flex items-start justify-between gap-3">
                       <div className="text-xs font-bold text-gray-500">Bài nộp gần nhất</div>
                       <div className="text-xs font-black text-gray-900 text-right">
                         {latestSubmittedAt ? formatDateTime(latestSubmittedAt) : '—'}
                       </div>
                     </div>
                   </div>
                 </div>
 
                 {!hasCorrection ? (
                   <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center">
                     <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-400">
                       <CheckCircle2 className="h-5 w-5" />
                     </div>
                     <div className="mt-3 text-sm font-black text-gray-900">Chưa có bài chấm</div>
                     <div className="mt-1 text-xs font-medium text-gray-500">
                       Khi giáo viên chấm, phần “Bài đã chấm” sẽ hiển thị ở đây.
                     </div>
                   </div>
                 ) : null}
               </div>
             </div>
           </div>
         </ScrollArea>
       </DialogContent>
     </Dialog>
   )
 }

