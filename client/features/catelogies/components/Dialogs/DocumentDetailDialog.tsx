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
import { IDocument } from "../../types";
import { Download, Printer, Share2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateOnly } from "@/libs/utils";

interface DocumentDetailDialogProps {
  document: IDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentDetailDialog({ document, isOpen, onClose }: DocumentDetailDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
          <div className="flex justify-between items-start pr-8">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold">{document.name}</DialogTitle>
              <DialogDescription className="text-blue-100/80">
                Đăng bởi {document.author || 'Hệ thống'} • {formatDateOnly(document.createdAt)}
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
            className="prose prose-blue max-w-none 
              prose-headings:font-bold prose-h2:text-2xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-8
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-ul:list-disc prose-li:text-gray-600
              prose-strong:text-gray-900 prose-strong:font-bold"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </ScrollArea>

        <DialogFooter className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
              <Printer className="w-4 h-4 mr-2" />
              In tài liệu
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {document.fileUrl && (
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Tải xuống ({document.fileSize})
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
