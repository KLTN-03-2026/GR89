import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import ImageExtension from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import { FontSize, TextStyle } from "@tiptap/extension-text-style"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import { Table } from "@tiptap/extension-table"

/**
 * Hàm khởi tạo danh sách các Extensions cho Tiptap Editor
 * @param placeholder Văn bản hiển thị khi editor trống
 * @returns Mảng các extension đã được cấu hình
 */
export const getEditorExtensions = (placeholder?: string) => [
  // Bộ công cụ cơ bản (Bold, Italic, List, Heading, ...)
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
  Underline, // Gạch chân
  TextStyle, // Hỗ trợ style cho text (màu, cỡ chữ)
  Color, // Màu chữ
  Highlight.configure({ multicolor: true }), // Màu nền chữ (Highlight)
  // Cấu hình chèn ảnh
  ImageExtension.configure({
    allowBase64: true,
    HTMLAttributes: {
      class: "rounded-lg border shadow-sm max-w-full h-auto my-4",
    },
  }),
  // Căn lề (Trái, Giữa, Phải)
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  // Chèn liên kết (Link)
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-primary underline underline-offset-4 cursor-pointer",
    },
  }),
  Subscript, // Chỉ số dưới
  Superscript, // Chỉ số trên
  // Danh sách công việc (Checklist)
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  // Hỗ trợ Bảng (Table)
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  // Extension tùy chỉnh: Cỡ chữ
  FontSize,
  // Hiển thị chữ gợi ý khi editor trống
  Placeholder.configure({
    placeholder: placeholder || "Bắt đầu viết nội dung...",
  }),
]
