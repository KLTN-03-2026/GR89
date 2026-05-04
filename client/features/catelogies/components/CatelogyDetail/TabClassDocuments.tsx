import { TabsContent } from '@/components/ui/tabs'
import { DocumentItem } from '@/features/catelogies/components/Catelogy/DocumentItem'
import { IDocument } from '@/features/catelogies/types'
import { FileText } from 'lucide-react'

interface Props {
  documents: IDocument[]
  onView: (document: IDocument) => void
}

export default function TabClassDocuments({ documents, onView }: Props) {
  return (
    <TabsContent value="materials" className="space-y-6">
      {documents.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-gray-400">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có tài liệu bài học</h3>
          <p className="text-gray-500">Giáo viên sẽ cập nhật tài liệu sớm. Bạn quay lại sau nhé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {documents.map((doc, index) => (
            <DocumentItem
              key={doc._id ? `material-${doc._id}` : `material-${index}`}
              document={doc}
              onView={onView}
            />
          ))}
        </div>
      )}
    </TabsContent>
  )
}
