import { LucideIcon } from "lucide-react";

export type CategoryType = 'kids' | 'teenager' | 'adult';
export type DocumentType = 'material' | 'homework';

export interface IDocument {
  id: string;
  title: string;
  description: string;
  content: string; // Rich text (HTML)
  createdAt: string;
  fileUrl?: string;
  fileSize?: string;
  author?: string;
  type: DocumentType;
  deadline?: string; // For homework
  isSubmitted?: boolean;
}

export interface IClass {
  id: string;
  name: string;
  description: string;
  level: string;
  studentCount: number;
  lessonCount: number;
  category: CategoryType;
  startDate: string;
  teacherName: string;
  schedule: string;
  documents: IDocument[];
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
