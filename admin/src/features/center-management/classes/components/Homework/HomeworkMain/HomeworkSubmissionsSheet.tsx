'use client'

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge'
import { FileCheck, Users, Clock, CheckCircle2, Search } from 'lucide-react'
import { IHomework } from '../../../type'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HomeworkSubmissionActionsCell } from './HomeworkSubmissionActionsCell'

interface HomeworkSubmissionsSheetProps {
  homework: IHomework | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HomeworkSubmissionsSheet({ homework, open, onOpenChange }: HomeworkSubmissionsSheetProps) {
  const [search, setSearch] = useState('')

  const submissions = homework?.submissions || []
  const filteredSubmissions = submissions.filter(s =>
    s.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = submissions.filter(s => s.status === 'pending').length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-150 w-full p-0 flex flex-col h-full border-none shadow-2xl">
        <SheetHeader className="p-8 pb-6 bg-gray-50/50 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-2xl font-black text-gray-900">{homework?.title}</SheetTitle>
              <SheetDescription className="font-medium">Danh sách bài nộp từ học viên</SheetDescription>
            </div>
            <Badge variant="outline" className="bg-white border-indigo-100 text-indigo-600 font-bold px-3 py-1 rounded-full">
              <FileCheck className="w-3.5 h-3.5 mr-1.5" /> Bài tập về nhà
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tổng nộp</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="text-xl font-black text-gray-900">{submissions.length}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Chờ chấm</p>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xl font-black text-gray-900">{pendingCount}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Đã xong</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xl font-black text-gray-900">{submissions.length - pendingCount}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 w-full overflow-auto">
          <div className="p-8 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm tên học viên..."
                className="pl-10 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <div key={sub._id} className="bg-white rounded-3xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-indigo-50/50 transition-all space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {sub.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-900">{sub.user?.fullName}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                          <Clock className="w-3 h-3" />
                          {new Date(sub.submittedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={sub.status === 'graded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                      {sub.status === 'graded' ? 'Đã chấm' : 'Chờ chấm'}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-3 rounded-xl font-medium">
                    {sub.content.replace(/<[^>]*>?/gm, '').slice(0, 100)}...
                  </div>

                  {homework ? (
                    <HomeworkSubmissionActionsCell
                      homeworkId={homework._id}
                      submission={sub}
                    />
                  ) : null}
                </div>
              ))}

              {filteredSubmissions.length === 0 && (
                <div className="py-20 text-center space-y-6 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Users className="w-8 h-8 text-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-gray-900">Chưa có bài nộp nào</h4>
                    <p className="text-gray-400 text-xs max-w-28 mx-auto font-medium">Hiện tại chưa có học viên nào nộp bài cho bài tập này.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-8 bg-gray-50 border-t border-gray-100 shrink-0">
          <div className="flex items-center justify-end w-full">
            <Button variant="outline" className="rounded-xl px-8 h-12 font-bold" onClick={() => onOpenChange(false)}>Đóng</Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
