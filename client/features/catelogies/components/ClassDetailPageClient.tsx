'use client'

import { useState } from "react"
import type { IClass, IDocument } from "../types"
import { DocumentItem } from "./DocumentItem"
import { DocumentDetailDialog } from "./DocumentDetailDialog"
import { SolutionDetailDialog } from "./SolutionDetailDialog"
import { BookOpen, Calendar, Clock, GraduationCap, Upload, FileText, CheckCircle2, Lightbulb, Gift, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDateOnly } from "@/libs/utils"

export function ClassDetailPageClient({ classItem }: { classItem: IClass }) {
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null)
  const [selectedSolution, setSelectedSolution] = useState<IDocument | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSolutionOpen, setIsSolutionOpen] = useState(false)

  const materials = classItem.documents
  const homeworks = classItem.homeworks

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

          <TabsContent value="materials" className="space-y-6">
            {materials.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gray-400">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có tài liệu bài học</h3>
                <p className="text-gray-500">Giáo viên sẽ cập nhật tài liệu sớm. Bạn quay lại sau nhé.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {materials.map((doc, index) => (
                  <DocumentItem
                    key={doc._id ? `material-${doc._id}` : `material-${index}`}
                    document={doc}
                    onView={handleViewDocument}
                  />
                ))}
              </div>
            )}
          </TabsContent>

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
                                  onClick={() =>
                                    handleViewDocument({
                                      ...doc,
                                      name: doc?.name  ?? `Tài liệu ${docIndex + 2}`,
                                      content: doc?.content ?? '',
                                    })
                                  }
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
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">
                        Tải file lên
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
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
