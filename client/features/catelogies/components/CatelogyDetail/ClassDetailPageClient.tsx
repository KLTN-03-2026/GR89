'use client'

import { useState } from "react"
import type { IClass, IDocument } from "../../types"
import { DocumentDetailDialog } from "../Dialogs/DocumentDetailDialog"
import { SolutionDetailDialog } from "../Dialogs/SolutionDetailDialog"
import { BookOpen, Calendar, Clock, GraduationCap, FileText, CheckCircle2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDateOnly } from "@/libs/utils"
import TabClassDocuments from "@/features/catelogies/components/CatelogyDetail/TabClassDocuments"
import TabClassHomework from "@/features/catelogies/components/CatelogyDetail/TabClassHomework"

export function ClassDetailPageClient({ classItem }: { classItem: IClass }) {
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null)
  const [selectedSolution, setSelectedSolution] = useState<IDocument | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSolutionOpen, setIsSolutionOpen] = useState(false)

  const handleViewDocument = (doc: IDocument) => {
    setSelectedDoc(doc)
    setIsDialogOpen(true)
  }

  const handleViewSolution = (doc: IDocument) => {
    setSelectedSolution(doc)
    setIsSolutionOpen(true)
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white border-b border-gray-100 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 font-bold">
                  {classItem.level}
                </Badge>
                <span className="text-gray-400">•</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Lớp học trung tâm</span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900">{classItem.name}</h1>
              {classItem.description ? (
                <p className="text-lg text-gray-500 max-w-3xl leading-relaxed">{classItem.description}</p>
              ) : null}

              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Giảng viên</p>
                    <p className="text-sm font-bold text-gray-900">{classItem.teacherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Khai giảng</p>
                    <p className="text-sm font-bold text-gray-900">{formatDateOnly(new Date(classItem.startDate || 0))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Lịch học</p>
                    <p className="text-sm font-bold text-gray-900">{classItem.schedule}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-3xl p-8 text-white w-full md:w-72 shadow-xl shadow-blue-100">
              <div className="flex justify-between items-center mb-6">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-100">Tiến độ</span>
              </div>
              <p className="text-3xl font-bold mb-2">0 / {classItem.lessonCount}</p>
              <p className="text-sm text-blue-100">Tài liệu đã học</p>
              <div className="w-full h-2 bg-white/20 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-white w-0 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="bg-gray-100 p-1.5 rounded-2xl mb-8">
            <TabsTrigger value="materials" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">
              <FileText className="w-4 h-4 mr-2" />
              Tài liệu bài học
            </TabsTrigger>
            <TabsTrigger value="homeworks" className="rounded-xl px-8 py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Bài tập về nhà
            </TabsTrigger>
          </TabsList>

          <TabClassDocuments documents={classItem.documents} onView={handleViewDocument} />

          <TabClassHomework homeworks={classItem.homeworks} onView={handleViewSolution} />
        </Tabs>
      </div>

      <DocumentDetailDialog
        document={selectedDoc}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <SolutionDetailDialog
        document={selectedSolution}
        isOpen={isSolutionOpen}
        onClose={() => setIsSolutionOpen(false)}
      />
    </div>
  )
}
