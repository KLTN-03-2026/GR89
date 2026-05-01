'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IDocument } from "../types";
import { Download, Printer, X, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SolutionDetailDialogProps {
  document: IDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SolutionDetailDialog({ document, isOpen, onClose }: SolutionDetailDialogProps) {
  if (!document || !document.solution) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white relative">
          <div className="flex justify-between items-start pr-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Bài giải từ giáo viên</span>
              </div>
              <DialogTitle className="text-2xl font-bold">Đáp án: {document.title}</DialogTitle>
              <DialogDescription className="text-emerald-100/80">
                Cập nhật lúc {document.solution.publishedAt}
              </DialogDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8 bg-white">
          <div 
            className="prose prose-emerald max-w-none 
              prose-headings:font-bold prose-h3:text-xl prose-h3:text-emerald-800 prose-h3:mt-6
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-ul:list-disc prose-li:text-gray-600
              prose-strong:text-gray-900 prose-strong:font-bold"
            dangerouslySetInnerHTML={{ __html: document.solution.content }}
          />
        </ScrollArea>

        <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-emerald-600">
              <Printer className="w-4 h-4 mr-2" />
              In bài giải
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {document.solution.fileUrl && (
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                <Download className="w-4 h-4 mr-2" />
                Tải file bài giải ({document.solution.fileSize})
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
