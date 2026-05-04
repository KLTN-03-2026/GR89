'use client'

import { IDocument } from "../types";
import { FileText, Download, Calendar, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentItemProps {
  document: IDocument;
  onView: (doc: IDocument) => void;
}

export function DocumentItem({ document, onView }: DocumentItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <FileText className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => onView(document)}>
            {document.name}
          </h4>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{document.createdAt}</span>
            </div>
            {document.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{document.author}</span>
              </div>
            )}
            {document.fileSize && (
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">
                {document.fileSize}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" onClick={() => onView(document)}>
          <Eye className="w-4 h-4 mr-1.5" />
          Xem
        </Button>
        {document.fileUrl && (
          <Button variant="outline" size="sm" className="text-gray-500 hover:border-emerald-500 hover:text-emerald-600">
            <Download className="w-4 h-4 mr-1.5" />
            Tải về
          </Button>
        )}
      </div>
    </div>
  );
}
