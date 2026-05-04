"use client"

import { useEditor, EditorContent, Editor } from "@tiptap/react"
import { BubbleMenu } from "@tiptap/react/menus"
import { Toolbar } from "./Toolbar"
import { useEffect } from "react"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2,
  Plus,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import { getEditorExtensions } from "./extensions"
import { cn } from "@/libs/utils"
import { uploadEditorImage } from "@/libs/apis/api"

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichEditor({ value, onChange, placeholder, className }: RichEditorProps) {
  // Khởi tạo Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: getEditorExtensions(placeholder), // Lấy danh sách extensions từ file riêng
    content: value,
    editorProps: {
      attributes: {
        // Cấu hình class cho vùng soạn thảo
        class: "max-w-none w-full bg-background px-4 py-3 text-sm focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-full",
      },
      // Xử lý kéo thả ảnh
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const files = event.dataTransfer.files;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith("image/")) {
              const loadingToast = toast.loading("Đang tải ảnh lên...");
              uploadEditorImage(file)
                .then((res) => {
                  if (res.success && res.data) {
                    const { schema } = view.state;
                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                    const node = schema.nodes.image.create({ src: res.data.url });
                    const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
                    view.dispatch(transaction);
                    toast.success("Tải ảnh lên thành công");
                  } else {
                    toast.error(res.message || "Tải ảnh lên thất bại");
                  }
                })
                .catch(() => {
                  toast.error("Đã có lỗi xảy ra khi tải ảnh lên");
                })
                .finally(() => {
                  toast.dismiss(loadingToast);
                });
            }
          }
          return true;
        }
        return false;
      },

      // Xử lý dán ảnh từ Clipboard (Ctrl + V)
      handlePaste: (view, event) => {
        if (event.clipboardData && event.clipboardData.files && event.clipboardData.files[0]) {
          const files = event.clipboardData.files;
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith("image/")) {
              const loadingToast = toast.loading("Đang dán ảnh...");
              uploadEditorImage(file)
                .then((res) => {
                  if (res.success && res.data) {
                    const { schema } = view.state;
                    const node = schema.nodes.image.create({ src: res.data.url });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                    toast.success("Dán ảnh thành công");
                  } else {
                    toast.error(res.message || "Tải ảnh lên thất bại");
                  }
                })
                .catch(() => {
                  toast.error("Đã có lỗi xảy ra khi tải ảnh lên");
                })
                .finally(() => {
                  toast.dismiss(loadingToast);
                });
            }
          }
          return true;
        }
        return false;
      },
    },
    // Cập nhật dữ liệu khi nội dung thay đổi
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Đồng bộ dữ liệu từ props vào editor khi có thay đổi từ bên ngoài
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div className={cn("flex flex-col w-full h-full min-h-[50vh] group max-h-[70vh]", className)}>
      {/* Thanh công cụ chính */}
      <Toolbar editor={editor} />

      {/* Menu nổi nhanh khi bôi đen văn bản */}
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="flex items-center gap-0.5 border bg-background shadow-md rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 p-0", editor.isActive("bold") && "bg-accent")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 p-0", editor.isActive("italic") && "bg-accent")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 p-0", editor.isActive("underline") && "bg-accent")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </Button>
            <Separator orientation="vertical" className="h-4 mx-0.5" />
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 w-7 p-0", editor.isActive("highlight") && "bg-accent")}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-3.5 w-3.5" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Menu nổi dành riêng cho thao tác với Bảng (Table) */}
      {editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }: { editor: Editor }) => editor.isActive("table")}
        >
          <div className="flex items-center gap-0.5 border bg-background shadow-md rounded-md p-1 overflow-x-auto max-w-[90vw]">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-sky-600"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              title="Thêm cột bên trái"
            >
              <Plus className="h-3.5 w-3.5 mr-[-4px]" />
              <Columns className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-sky-600"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Thêm cột bên phải"
            >
              <Columns className="h-3.5 w-3.5" />
              <Plus className="h-3.5 w-3.5 ml-[-4px]" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-600"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              title="Xóa cột"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>

            <Separator orientation="vertical" className="h-4 mx-0.5" />

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-amber-600"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              title="Thêm hàng phía trên"
            >
              <Plus className="h-3.5 w-3.5 mr-[-4px]" />
              <Rows className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-amber-600"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Thêm hàng phía dưới"
            >
              <Rows className="h-3.5 w-3.5" />
              <Plus className="h-3.5 w-3.5 ml-[-4px]" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-600"
              onClick={() => editor.chain().focus().deleteRow().run()}
              title="Xóa hàng"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>

            <Separator orientation="vertical" className="h-4 mx-0.5" />

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-indigo-600"
              onClick={() => editor.chain().focus().mergeOrSplit().run()}
              title="Gộp/Tách ô"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-600"
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Xóa toàn bộ bảng"
            >
              <TableIcon className="h-3.5 w-3.5 mr-[-4px]" />
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </BubbleMenu>
      )}

      {/* Vùng nội dung soạn thảo */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white border border-input border-t-0 rounded-b-md">
        <EditorContent editor={editor} className="flex-1 overflow-auto h-full [&_.ProseMirror]:focus:outline-none" />
      </div>
    </div>
  )
}