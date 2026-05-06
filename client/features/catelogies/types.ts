import { User } from "@/types";
import { LucideIcon } from "lucide-react";

export type CategoryType = 'kids' | 'teenager' | 'adult';
export type DocumentType = 'material' | 'homework';

export interface IDocument {
  _id: string;
  name: string;
  description: string;
  content: string; // Rich text (HTML)
  createdAt: string;
  fileUrl?: string;
  fileSize?: string;
  author?: string;
  type: DocumentType;
  deadline?: string; // For homework
  isSubmitted?: boolean;
  solution?: {
    content: string; // Rich text
    fileUrl?: string;
    fileSize?: string;
    publishedAt: string;
  };
}

export interface IHomeworkSubmission {
  _id: string;
  studentId: string;
  content: string; // Rich text (HTML)
  createdAt: string;
}


export interface IHomework {
  _id: string
  title: string
  description: string
  documents: IDocument[]
  deadline: Date
  submissions: IHomeworkSubmission[];
  submittedAt: Date
}

export interface IClass {
  _id: string;
  name: string;
  description: string;
  level: string;
  studentCount: number;
  lessonCount: number;
  category: CategoryType;
  startDate: string;
  teacher: User;
  teacherId?: string;
  schedule: string;
  status?: 'opening' | 'ongoing' | 'finished';
  documents: IDocument[];
  homeworks: IHomework[];
}

export interface CenterClassStats {
  totalClasses: number
  totalStudentsUnique: number
  totalStudentsEnrollments: number
  totalTeachers: number
  byCategory: Record<
    'kids' | 'teenager' | 'adult',
    {
      classes: number
      studentsUnique: number
      studentsEnrollments: number
      teachers: number
    }
  >
}

export interface ICategoryConfig {
  title: string;
  titleHighlight: string;
  icon: LucideIcon;
  welcomeIcon: LucideIcon; // New icon for welcome section instead of streak
  gradient: string;
  welcomeBackground: string;
  highlightColor: string;
}
