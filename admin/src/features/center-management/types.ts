export interface IStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface IClassDocument {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'video' | 'audio' | 'link';
  size?: string;
  uploadedAt: string;
  url: string;
}

export interface ICenterClass {
  id: string;
  name: string;
  category: 'kids' | 'teenager' | 'adult';
  teacherName: string;
  startDate: string;
  schedule: string;
  status: 'opening' | 'ongoing' | 'finished';
  password?: string;
  isActive: boolean;
  students: IStudent[];
  documents: IClassDocument[];
}

export interface IGlobalDocument {
  _id: string;
  id: string;
  name: string;
  category: string;
  content: string; // Rich text content
  updatedAt: string;
  createdAt: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  } | string;
}

export interface IHomeworkSubmission {
  id: string;
  studentName: string;
  studentAvatar?: string;
  className: string;
  title: string;
  submittedAt: string;
  driveLink: string;
  status: 'pending' | 'corrected';
  solutionUrl?: string;
}
