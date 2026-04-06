import { Role } from '@/features/role/types'

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

export interface RolePayload {
  name: string
  description: string
  permissions: string[]
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Temporary local store for role module until backend endpoints are available.
let mockRoles: Role[] = [
  {
    _id: 'admin',
    name: 'Admin',
    description: 'Quản trị viên',
    permissions: ['users:read', 'users:write', 'roles:manage', 'content:all'],
  },
  {
    _id: 'user',
    name: 'User',
    description: 'Người dùng',
    permissions: ['app:use'],
  },
  {
    _id: 'content',
    name: 'Content Manager',
    description: 'Quản lý nội dung bài học',
    permissions: [
      'content:read',
      'content:write',
      'content:delete',
      'lessons:manage',
      'vocabulary:manage',
      'grammar:manage',
      'speaking:manage',
      'listening:manage',
      'reading:manage',
      'writing:manage',
    ],
  },
  {
    _id: 'moderator',
    name: 'Moderator',
    description: 'Điều hành viên',
    permissions: ['users:read', 'content:moderate'],
  },
]

export async function getRoleList(): Promise<ApiResponse<Role[]>> {
  await delay(250)
  return { success: true, data: mockRoles }
}

export async function createRole(payload: RolePayload): Promise<ApiResponse<Role>> {
  await delay(250)
  const newRole: Role = {
    _id: `${payload.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    ...payload,
  }
  mockRoles = [newRole, ...mockRoles]
  return { success: true, data: newRole, message: 'Tạo vai trò thành công' }
}

export async function updateRole(roleId: string, payload: RolePayload): Promise<ApiResponse<Role>> {
  await delay(250)
  const idx = mockRoles.findIndex((r) => r._id === roleId)
  if (idx < 0) {
    return { success: false, message: 'Không tìm thấy vai trò' }
  }

  const updated: Role = { ...mockRoles[idx], ...payload }
  mockRoles[idx] = updated
  return { success: true, data: updated, message: 'Cập nhật vai trò thành công' }
}

export async function deleteRole(roleId: string): Promise<ApiResponse<Role>> {
  await delay(250)
  const role = mockRoles.find((r) => r._id === roleId)
  if (!role) {
    return { success: false, message: 'Không tìm thấy vai trò' }
  }

  mockRoles = mockRoles.filter((r) => r._id !== roleId)
  return { success: true, data: role, message: 'Xóa vai trò thành công' }
}
