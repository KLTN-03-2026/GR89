import { ICenterClass, IHomeworkSubmission } from "../center-management/classes/type";

export const MOCK_CENTER_CLASSES: ICenterClass[] = [
  {
    id: "class-1",
    name: "IELTS Fighter 01",
    category: "teenager",
    teacherName: "Mr. Kevin",
    startDate: "2024-05-01",
    schedule: "Thứ 2, 4, 6 (18:00 - 20:00)",
    status: "ongoing",
    password: "123",
    isActive: true,
    students: [
      { id: "s1", name: "Nguyễn Văn A", email: "vana@gmail.com", phone: "0901234567", joinDate: "2024-04-15", status: "active" },
      { id: "s2", name: "Trần Thị B", email: "thib@gmail.com", phone: "0907654321", joinDate: "2024-04-16", status: "active" },
    ],
    documents: [
      { id: "d1", title: "IELTS Speaking Part 1 Tips", type: "pdf", size: "1.2MB", uploadedAt: "2024-05-02", url: "#" },
      { id: "d2", title: "Vocabulary for Environment", type: "doc", size: "800KB", uploadedAt: "2024-05-05", url: "#" },
    ]
  },
  {
    id: "class-2",
    name: "English Kids Starters",
    category: "kids",
    teacherName: "Ms. Linda",
    startDate: "2024-05-10",
    schedule: "Thứ 3, 5 (17:30 - 19:00)",
    status: "opening",
    password: "123",
    isActive: true,
    students: [],
    documents: []
  },
  {
    id: "class-3",
    name: "Business English Advanced",
    category: "adult",
    teacherName: "Mr. Robert",
    startDate: "2024-04-20",
    schedule: "Thứ 7, CN (08:30 - 11:30)",
    status: "ongoing",
    password: "123",
    isActive: false,
    students: [
      { id: "s3", name: "Lê Văn C", email: "vanc@gmail.com", phone: "0988888888", joinDate: "2024-04-10", status: "active" },
    ],
    documents: []
  }
];


export const MOCK_HOMEWORK_SUBMISSIONS: IHomeworkSubmission[] = [
  {
    id: "sub-1",
    studentName: "Nguyễn Văn A",
    className: "IELTS Fighter 01",
    title: "Writing Task 1 - Line Graph",
    submittedAt: "2024-05-12 20:30",
    driveLink: "https://drive.google.com/file/d/1example",
    status: "pending"
  },
  {
    id: "sub-2",
    studentName: "Trần Thị B",
    className: "IELTS Fighter 01",
    title: "Writing Task 1 - Line Graph",
    submittedAt: "2024-05-12 21:15",
    driveLink: "https://drive.google.com/file/d/2example",
    status: "corrected",
    solutionUrl: "https://drive.google.com/file/d/solution-example"
  }
];
