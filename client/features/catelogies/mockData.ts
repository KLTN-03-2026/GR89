import { Baby, Rocket, Briefcase, GraduationCap, Palette, Star, ShieldCheck } from "lucide-react";
import { ICategoryConfig, IClass } from "./types";

export const CATEGORY_CONFIGS: Record<string, ICategoryConfig> = {
  kids: {
    title: "ActiveLearning",
    titleHighlight: "Kids Academy",
    icon: Baby,
    welcomeIcon: Palette,
    gradient: "from-amber-400 to-orange-500",
    welcomeBackground: "from-amber-400 via-orange-400 to-orange-500",
    highlightColor: "text-orange-600",
  },
  teenager: {
    title: "ActiveLearning",
    titleHighlight: "IELTS Fighter",
    icon: GraduationCap,
    welcomeIcon: Star,
    gradient: "from-sky-400 to-indigo-600",
    welcomeBackground: "from-sky-400 via-blue-500 to-indigo-600",
    highlightColor: "text-blue-600",
  },
  adult: {
    title: "ActiveLearning",
    titleHighlight: "Professional",
    icon: Briefcase,
    welcomeIcon: ShieldCheck,
    gradient: "from-red-400 to-red-600",
    welcomeBackground: "from-red-400 via-red-500 to-red-600",
    highlightColor: "text-red-100",
  },
};

const MOCK_DOCUMENTS = [
  {
    id: "doc1",
    title: "Tài liệu ôn tập chương 1",
    description: "Tổng hợp kiến thức trọng tâm chương 1 về thì hiện tại đơn.",
    content: `<h2>Kiến thức trọng tâm Chương 1</h2><p>Nội dung chi tiết tài liệu ôn tập...</p>`,
    createdAt: "2024-04-20 08:30",
    fileUrl: "/documents/chương-1.pdf",
    fileSize: "1.2 MB",
    author: "Teacher Mary",
    type: 'material' as const
  },
  {
    id: "hw1",
    title: "Bài tập về nhà: Writing Task 1",
    description: "Hãy viết một đoạn văn ngắn miêu tả về gia đình bạn.",
    content: `<h2>Bài tập Writing Task 1</h2><p>Yêu cầu: Viết tối thiểu 150 từ...</p>`,
    createdAt: "2024-04-22 10:00",
    fileUrl: "/documents/hw1.docx",
    fileSize: "450 KB",
    author: "Teacher John",
    type: 'homework' as const,
    deadline: "2024-04-30 23:59",
    isSubmitted: false
  }
];

export const MOCK_CLASSES: IClass[] = [
  {
    id: "k1",
    name: "English Starters A1",
    description: "Lớp học nền tảng cho trẻ mầm non.",
    level: "Starters",
    studentCount: 15,
    lessonCount: 24,
    category: "kids",
    startDate: "01/05/2024",
    teacherName: "Ms. Linda",
    schedule: "Thứ 2, 4, 6 (18:00 - 19:30)",
    documents: MOCK_DOCUMENTS
  },
  {
    id: "t1",
    name: "IELTS Intensive 6.5+",
    description: "Lớp luyện thi IELTS cấp tốc mục tiêu 6.5.",
    level: "B2 - Intermediate",
    studentCount: 12,
    lessonCount: 48,
    category: "teenager",
    startDate: "15/05/2024",
    teacherName: "Mr. Kevin",
    schedule: "Thứ 3, 5, 7 (19:30 - 21:00)",
    documents: MOCK_DOCUMENTS
  },
  {
    id: "a1",
    name: "Business Communication",
    description: "Tiếng Anh giao tiếp chuyên nghiệp cho người đi làm.",
    level: "C1 - Advanced",
    studentCount: 10,
    lessonCount: 30,
    category: "adult",
    startDate: "10/05/2024",
    teacherName: "Mr. Robert",
    schedule: "Thứ 7, CN (08:30 - 11:30)",
    documents: MOCK_DOCUMENTS
  }
];
