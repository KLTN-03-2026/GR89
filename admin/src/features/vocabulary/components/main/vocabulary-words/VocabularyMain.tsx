'use client'
import { DataTable, PageHeader } from "@/components/common";
import { SheetAddVocabulary } from "../../dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { columnsVocabulary } from "../../table/vocabulary-words/VocabularyColumn";
import { VocabularyTopic } from "@/features/vocabulary/types";
import { getVocabularyByTopicId, deleteManyVocabularies } from "@/features/vocabulary/services/api";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function VocabularyMain({ _id }: { _id: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [vocabularyTopic, setVocabularyTopic] = useState<VocabularyTopic | null>()
  const [refresh, setRefresh] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchVocabulary = async () => {
      setIsLoading(true)
      await getVocabularyByTopicId(_id)
        .then(res => {
          setVocabularyTopic(res.data as unknown as VocabularyTopic)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
    fetchVocabulary()
  }, [refresh, _id])

  const handleDeleteMultiple = (ids: string[]) => {
    setSelectedIds(ids)
    setOpenDeleteDialog(true)
  }

  const confirmDeleteMultiple = async () => {
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    await deleteManyVocabularies(selectedIds)
      .then((res) => {
        toast.success(`Đã xóa ${res.data?.deletedCount || 0} từ vựng thành công`)
        setOpenDeleteDialog(false)
        setSelectedIds([])
        setRefresh(!refresh)
      })
      .finally(() => {
        setIsDeleting(false)
      })
}

return (
  <>
    <div className="flex justify-between items-center mb-6">
      <header>
        <PageHeader
          title={`Chủ đề ${vocabularyTopic?.name || ''}`}
          subtitle={`Quản lý danh sách từ vựng chủ đề ${vocabularyTopic?.name || ''}`}
        />
      </header>

      <SheetAddVocabulary topicId={_id} callback={() => setRefresh(!refresh)} />
    </div>

    <Card className="rounded-[2rem] border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
      <CardContent className="p-0">
        {(!vocabularyTopic?.vocabularies || vocabularyTopic.vocabularies.length === 0) && !isLoading ? (
          <div className="text-center py-20 text-gray-500">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <p className="text-lg font-bold text-gray-900">Chưa có từ vựng nào</p>
            <p className="text-sm mt-1">Nhấn "Thêm từ vựng mới" để bắt đầu xây dựng kho tàng.</p>
          </div>
        ) : (
          <DataTable
            columns={columnsVocabulary(() => setRefresh(!refresh))}
            data={vocabularyTopic?.vocabularies || []}
            isLoading={isLoading}
            columnNameSearch="Từ vựng"
            handleDeleteMultiple={handleDeleteMultiple}
          />
        )}
      </CardContent>
    </Card>

    {/* Dialog xác nhận xóa nhiều */}
    <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
      <DialogContent className="rounded-[2rem] border-none shadow-2xl">
        <DialogHeader className="pt-8 px-8">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4 shadow-inner">
            <Trash2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-black text-gray-900">Xác nhận xóa nhiều</DialogTitle>
          <DialogDescription className="text-gray-500 font-medium pt-2">
            Bạn có chắc chắn muốn xóa <span className="text-rose-600 font-bold">{selectedIds.length}</span> từ vựng đã chọn không?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 mt-4 rounded-b-[2rem]">
          <Button
            variant="outline"
            onClick={() => {
              setOpenDeleteDialog(false)
              setSelectedIds([])
            }}
            disabled={isDeleting}
            className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600"
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDeleteMultiple}
            disabled={isDeleting}
            className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 font-black"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang Xử Lý...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Xác Nhận Xóa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
)
}
