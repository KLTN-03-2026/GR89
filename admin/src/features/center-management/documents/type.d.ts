import { User } from "@/features/user/types";

export interface IGlobalDocument {
  _id: string;
  name: string;
  category: IDocumentCategory
  content: string; // Rich text content
  updatedAt: string;
  createdAt: string;
  owner: User
}

export interface IDocumentCategory {
  _id: string;
  name: string;
  createdBy: User;
}