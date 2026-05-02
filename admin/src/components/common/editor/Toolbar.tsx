"use client"

import { type Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Highlighter,
  Palette,
  Image as ImageIcon,
  Link as LinkIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  CheckSquare,
  Upload,
  Table as TableIcon,
  Type,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState, useRef, useEffect } from "react"
import { DialogImageToMedia } from "@/components/common/dialog/DialogImageToMedia"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  EDITOR_COLORS,
  EDITOR_HIGHLIGHTS,
  EDITOR_FONT_SIZES,
} from "./constants"
import { toast } from "react-toastify"
import { uploadEditorImage } from "@/features/Media/services/api"

export function Toolbar({ editor }: { editor: Editor | null }) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State để ép UI re-render khi Tiptap update
  const [, setUpdate] = useState(0)

  useEffect(() => {
    if (!editor) return
    const handler = () => setUpdate(prev => prev + 1)
    editor.on('transaction', handler)
    return () => {
      editor.off('transaction', handler)
    }
  }, [editor])

  if (!editor) return null

  const addImage = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
    setIsImageDialogOpen(false)
  }

  const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const loadingToast = toast.loading("Đang tải ảnh lên...")
      try {
        const res = await uploadEditorImage(file)
        if (res.success && res.data) {
          addImage(res.data.url)
          toast.success("Tải ảnh lên thành công")
        } else {
          toast.error(res.message || "Tải ảnh lên thất bại")
        }
      } catch (error) {
        toast.error("Đã có lỗi xảy ra khi tải ảnh lên")
      } finally {
        toast.dismiss(loadingToast)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border border-input p-1 rounded-t-md border-b-0 bg-muted/50">
      {/* Lịch sử thao tác (Undo/Redo) */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Cấu hình Cỡ chữ */}
      <div className="flex items-center gap-0.5">
        <Popover open={isFontSizeOpen} onOpenChange={setIsFontSizeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 flex items-center gap-1 px-2 min-w-[60px] transition-all",
                editor.getAttributes("textStyle").fontSize ? "bg-sky-100 text-sky-700 font-bold border-sky-200" : "hover:bg-muted"
              )}
              title="Cỡ chữ"
            >
              <Type className="h-4 w-4" />
              <span className="text-xs">
                {editor.getAttributes("textStyle").fontSize?.replace("px", "") || "16"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-24 p-1" align="start">
            <div className="flex flex-col gap-0.5">
              {EDITOR_FONT_SIZES.map((size) => (
                <button
                  key={size}
                  className={cn(
                    "text-xs px-2 py-1.5 text-left hover:bg-accent rounded-sm transition-colors",
                    editor.getAttributes("textStyle").fontSize === size && "bg-accent font-bold"
                  )}
                  onClick={() => {
                    editor.chain().focus().setFontSize(size).run()
                    setIsFontSizeOpen(false)
                  }}
                >
                  {size.replace("px", "")}
                </button>
              ))}
              <Separator className="my-1" />
              <button
                className="text-xs px-2 py-1.5 text-left hover:bg-accent rounded-sm text-rose-500"
                onClick={() => {
                  editor.chain().focus().unsetFontSize().run()
                  setIsFontSizeOpen(false)
                }}
              >
                Mặc định
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Định dạng văn bản cơ bản */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("bold") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("italic") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("underline") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Gạch chân (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("strike") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Gạch ngang"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
      </div>

      {/* Màu sắc & Highlight */}
      <div className="flex items-center gap-0.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 transition-all",
                editor.getAttributes("textStyle").color ? "bg-sky-100 border border-sky-200" : "hover:bg-muted"
              )}
              title="Màu chữ"
            >
              <Palette className="h-4 w-4" style={{ color: editor.getAttributes("textStyle").color }} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-8 gap-1">
              {EDITOR_COLORS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "h-5 w-5 rounded-sm border border-muted transition-transform hover:scale-110",
                    editor.getAttributes("textStyle").color === color && "ring-2 ring-sky-500 ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                />
              ))}
              <button
                className="col-span-8 mt-1 text-[10px] hover:underline text-rose-500"
                onClick={() => editor.chain().focus().unsetColor().run()}
              >
                Xóa màu
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 transition-all",
                editor.isActive("highlight") ? "bg-sky-100 border border-sky-200" : "hover:bg-muted"
              )}
              title="Màu nền chữ"
            >
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-6 gap-1">
              {EDITOR_HIGHLIGHTS.map((color) => (
                <button
                  key={color}
                  className={cn(
                    "h-6 w-6 rounded-sm border border-muted transition-transform hover:scale-110",
                    editor.isActive("highlight", { color }) && "ring-2 ring-sky-500 ring-offset-1"
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                />
              ))}
              <button
                className="col-span-6 mt-1 text-[10px] hover:underline text-rose-500"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
              >
                Xóa highlight
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tiêu đề (Headings) */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((level) => (
          <Button
            key={level}
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor.isActive("heading", { level }) && "bg-accent text-accent-foreground shadow-sm"
            )}
            onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
            title={`Tiêu đề ${level}`}
          >
            {level === 1 ? <Heading1 className="h-4 w-4" /> : level === 2 ? <Heading2 className="h-4 w-4" /> : <Heading3 className="h-4 w-4" />}
          </Button>
        ))}
      </div>

      {/* Căn lề văn bản */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive({ textAlign: "left" }) ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Căn trái"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive({ textAlign: "center" }) ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Căn giữa"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive({ textAlign: "right" }) ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Căn phải"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Danh sách & Trích dẫn */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("bulletList") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Danh sách dấu chấm"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("orderedList") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Danh sách số"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("taskList") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Danh sách công việc"
        >
          <CheckSquare className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("blockquote") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Trích dẫn"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Chèn tài nguyên (Ảnh, Bảng, Link,...) */}
      <div className="flex items-center gap-0.5">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleLocalUpload}
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Tải ảnh lên từ máy tính"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          title="Chèn bảng"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          <TableIcon className="h-4 w-4" />
        </Button>

        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Chọn ảnh từ thư viện Media">
              <ImageIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Thư viện hình ảnh</DialogTitle>
            </DialogHeader>
            <DialogImageToMedia onSelect={(img) => addImage(img.url)} />
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("link") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => {
            const url = window.prompt("Nhập URL liên kết:")
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          title="Chèn liên kết"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("subscript") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          title="Chỉ số dưới"
        >
          <SubscriptIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0 transition-all",
            editor.isActive("superscript") ? "bg-sky-100 text-sky-700 shadow-inner border border-sky-200" : "hover:bg-muted"
          )}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          title="Chỉ số trên"
        >
          <SuperscriptIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
