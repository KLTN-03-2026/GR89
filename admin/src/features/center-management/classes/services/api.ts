import AuthorizedAxios from '@/lib/apis/authorizrAxios'
import { ICenterClass, IHomework } from '../type'

// Phản hồi chuẩn từ API
export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: {
    page?: number
    limit?: number
    total?: number
    pages?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

// Tham số truy vấn cho danh sách lớp học
export interface ClassQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  category?: string
  status?: string
}

// Dữ liệu tạo lớp học mới
export interface CreateClassRequest {
  name: string
  category: 'kids' | 'teenager' | 'adult'
  teacher: string
  startDate: string
  schedule: string
  status?: 'opening' | 'ongoing' | 'finished'
  password?: string
  maxStudents?: number | null
  isActive?: boolean
  documents?: string[]
}

/*=============================================================================
 * DANH SÁCH API QUẢN LÝ LỚP HỌC (CENTER CLASSES)
 *============================================================================*/

// Lấy chi tiết lớp học theo ID
export async function getCenterClassById(id: string): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.get<ApiResponse<ICenterClass>>(`/center-classes/${id}`)
  return response.data
}

// Tạo lớp học mới
export async function createCenterClass(data: CreateClassRequest): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.post<ApiResponse<ICenterClass>>('/center-classes', data)
  return response.data
}

// Cập nhật thông tin lớp học
export async function updateCenterClass(id: string, data: Partial<CreateClassRequest>): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.put<ApiResponse<ICenterClass>>(`/center-classes/${id}`, data)
  return response.data
}

export async function updateCenterClassActive(id: string, isActive: boolean): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.put<ApiResponse<ICenterClass>>(`/center-classes/${id}`, { isActive })
  return response.data
}

// Xóa lớp học
export async function deleteCenterClass(id: string): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.delete<ApiResponse<void>>(`/center-classes/${id}`)
  return response.data
}

/*=============================================================================
 * DANH SÁCH API QUẢN LÝ HỌC SINH (STUDENTS)
 *============================================================================*/

// Thêm học sinh vào lớp học
export async function addStudentToClass(classId: string, data: { userId: string, joinDate?: string }): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.post<ApiResponse<ICenterClass>>(`/center-classes/${classId}/students`, data)
  return response.data
}

// Xóa học sinh khỏi lớp học
export async function removeStudentFromClass(classId: string, userId: string): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.delete<ApiResponse<ICenterClass>>(`/center-classes/${classId}/students/${userId}`)
  return response.data
}

/*=============================================================================
 * DANH SÁCH API QUẢN LÝ TÀI LIỆU (DOCUMENTS)
 *============================================================================*/

export async function addDocumentToClass(classId: string, data: { documentId: string }): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.post<ApiResponse<ICenterClass>>(`/center-classes/${classId}/documents`, data)
  return response.data
}

export async function removeDocumentFromClass(classId: string, documentId: string): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.delete<ApiResponse<ICenterClass>>(`/center-classes/${classId}/documents/${documentId}`)
  return response.data
}

export async function setDocumentsForClass(classId: string, documentIds: string[]): Promise<ApiResponse<ICenterClass>> {
  const response = await AuthorizedAxios.put<ApiResponse<ICenterClass>>(`/center-classes/${classId}/documents`, { documentIds })
  return response.data
}

/*=============================================================================
 * DANH SÁCH API QUẢN LÝ BÀI TẬP (HOMEWORK)
 *============================================================================*/

// Giao bài tập mới (Admin/Teacher)
export async function createHomework(data: { centerClassId: string, title: string, description?: string, deadline: string, documentIds?: string[] }): Promise<ApiResponse<IHomework>> {
  const response = await AuthorizedAxios.post<ApiResponse<IHomework>>('/center-classes/homework', data)
  return response.data
}

export async function createHomeworkForClass(classId: string, data: { title: string, description?: string, deadline: string, documentIds?: string[] }): Promise<ApiResponse<IHomework>> {
  const response = await AuthorizedAxios.post<ApiResponse<IHomework>>(`/center-classes/${classId}/homeworks`, data)
  return response.data
}

export async function updateHomework(homeworkId: string, data: { title?: string, description?: string, deadline?: string, documentIds?: string[] }): Promise<ApiResponse<IHomework>> {
  const response = await AuthorizedAxios.put<ApiResponse<IHomework>>(`/center-classes/homework/${homeworkId}`, data)
  return response.data
}

// Chấm bài cho học sinh (Admin/Teacher)
export async function gradeHomework(homeworkId: string, data: { userId: string, feedback: string }): Promise<ApiResponse<IHomework>> {
  const response = await AuthorizedAxios.post<ApiResponse<IHomework>>(`/center-classes/homework/${homeworkId}/grade`, data)
  return response.data
}

export async function deleteHomeworkForClass(classId: string, homeworkId: string): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.delete<ApiResponse<void>>(`/center-classes/${classId}/homeworks/${homeworkId}`)
  return response.data
}

// Xóa bài tập
export async function deleteHomework(id: string): Promise<ApiResponse<void>> {
  const response = await AuthorizedAxios.delete<ApiResponse<void>>(`/center-classes/homework/${id}`)
  return response.data
}

// Lấy chi tiết bài tập (kèm danh sách bài nộp)
export async function getHomeworkById(id: string): Promise<ApiResponse<IHomework>> {
  const response = await AuthorizedAxios.get<ApiResponse<IHomework>>(`/center-classes/homework/${id}`)
  return response.data
}
