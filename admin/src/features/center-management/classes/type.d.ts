import { User } from "@/features/user/types";
import { IGlobalDocument } from "../documents/type";

export interface IClassStudent {
  user: User;
  joinDate: string;
}

export interface ISubmission {
  _id: string;
  user: User;
  content: string;
  feedback: string;
  submittedAt: string;
  gradedAt?: string;
  status: 'pending' | 'graded';
}

export interface IHomework {
  _id: string;
  title: string;
  description: string;
  submittedAt: string;
  deadline: string;
  documents?: IGlobalDocument[];
  submissions: ISubmission[];
}

export interface ICenterClass {
  _id: string;
  name: string;
  category: 'kids' | 'teenager' | 'adult';
  teacher: User;
  startDate: string;
  schedule: string;
  status: 'opening' | 'ongoing' | 'finished';
  password?: string;
  isActive: boolean;
  students: IClassStudent[];
  documents: IGlobalDocument[];
  homeworks: IHomework[];
  createdAt: string;
  updatedAt: string;
}
