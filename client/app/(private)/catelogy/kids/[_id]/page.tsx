'use client'

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MOCK_CLASSES } from "@/features/catelogies/mockData";
import { DocumentItem } from "@/features/catelogies/components/DocumentItem";
import { DocumentDetailDialog } from "@/features/catelogies/components/DocumentDetailDialog";
import { SolutionDetailDialog } from "@/features/catelogies/components/SolutionDetailDialog";
import { IDocument } from "@/features/catelogies/types";
import { BookOpen, Calendar, Clock, GraduationCap, Upload, FileText, CheckCircle2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params._id as string;
  const [selectedDoc, setSelectedDoc] = useState<IDocument | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<IDocument | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  const classItem = useMemo(() => {
    return MOCK_CLASSES.find(c => c.id === classId);
  }, [classId]);

  if (!classItem) return <div>Không tìm thấy lớp học</div>;

  const materials = classItem.documents.filter(d => d.type === 'material');
  const homeworks = classItem.documents.filter(d => d.type === 'homework');

  const handleViewDocument = (doc: IDocument) => {
    setSelectedDoc(doc);
    setIsDialogOpen(true);
  };

  const handleViewSolution = (doc: IDocument) => {
    setSelectedSolution(doc);
    setIsSolutionOpen(true);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Lớp học */}
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
              <p className="text-lg text-gray-500 max-w-3xl leading-relaxed">{classItem.description}</p>

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
                    <p className="text-sm font-bold text-gray-900">{classItem.startDate}</p>
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
              <p className="text-3xl font-bold mb-2">12 / {classItem.lessonCount}</p>
              <p className="text-sm text-blue-100">Tài liệu đã học</p>
              <div className="w-full h-2 bg-white/20 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-white w-1/2 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung tài liệu & BTVN */}
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
            <div className="grid grid-cols-1 gap-4">
              {materials.map(doc => (
                <DocumentItem key={doc.id} document={doc} onView={handleViewDocument} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="homeworks" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {homeworks.map(hw => (
                <div key={hw.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                  <div className="flex-1 p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase">
                          <Clock className="w-3.5 h-3.5" />
                          Hạn chót: {hw.deadline}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{hw.title}</h3>
                      </div>
                      <Badge variant={hw.isSubmitted ? "outline" : "default"} className={hw.isSubmitted ? "text-emerald-600 border-emerald-100 bg-emerald-50" : "bg-orange-500"}>
                        {hw.isSubmitted ? "Đã nộp bài" : "Chưa nộp"}
                      </Badge>
                    </div>
                    <p className="text-gray-500 leading-relaxed">{hw.description}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" onClick={() => handleViewDocument(hw)}>
                        Xem chi tiết đề bài
                      </Button>
                      {hw.solution && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold"
                          onClick={() => handleViewSolution(hw)}
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Xem bài giải từ cô giáo
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
  );
}
