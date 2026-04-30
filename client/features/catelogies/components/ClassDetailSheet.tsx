'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { IClass, IDocument } from "../types";
import { DocumentItem } from "./DocumentItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Info } from "lucide-react";

interface ClassDetailSheetProps {
  classItem: IClass | null;
  isOpen: boolean;
  onClose: () => void;
  onViewDocument: (doc: IDocument) => void;
}

export function ClassDetailSheet({ classItem, isOpen, onClose, onViewDocument }: ClassDetailSheetProps) {
  if (!classItem) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl w-full flex flex-col p-0 border-none shadow-2xl">
        <SheetHeader className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium uppercase tracking-wider text-blue-100">Chi tiết lớp học</span>
          </div>
          <SheetTitle className="text-3xl font-bold text-white mb-2">{classItem.name}</SheetTitle>
          <SheetDescription className="text-blue-100/80 text-base leading-relaxed">
            {classItem.description}
          </SheetDescription>
          
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{classItem.studentCount}</p>
              <p className="text-xs text-blue-200 uppercase tracking-tighter">Học viên</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{classItem.lessonCount}</p>
              <p className="text-xs text-blue-200 uppercase tracking-tighter">Bài học</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{classItem.level}</p>
              <p className="text-xs text-blue-200 uppercase tracking-tighter">Trình độ</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col bg-gray-50/50">
          <div className="px-8 py-6 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              Danh sách tài liệu
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                {classItem.documents.length}
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
              <Info className="w-3.5 h-3.5" />
              Tài liệu cập nhật mới nhất
            </div>
          </div>

          <ScrollArea className="flex-1 px-8 pb-8">
            <div className="space-y-4">
              {classItem.documents.map((doc) => (
                <DocumentItem 
                  key={doc.id} 
                  document={doc} 
                  onView={onViewDocument} 
                />
              ))}
              
              {classItem.documents.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Chưa có tài liệu nào cho lớp này.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
