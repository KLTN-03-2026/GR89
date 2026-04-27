'use client'

import { login, logout } from "@/features/login/services/api";
import { User } from "@/features/user/types";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";


interface LoginRequest {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => { },
  logout: () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('admin') || 'null'))
  }, []);

  const loginUser = async (credentials: LoginRequest) => {
    setIsLoading(true)
    await login(credentials)
      .then((res) => {
        setUser(res.data as User)
        toast.success('Đăng nhập thành công')
        router.push('/')
        localStorage.setItem('admin', JSON.stringify(res.data))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const logoutUser = async () => {
    const userRole = user?.role || 'admin'
    await logout(userRole)
      .then(() => {
        setUser(null)
        toast.success('Đăng xuất thành công')
        router.push('/login')
        localStorage.removeItem('admin')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login: loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext);
}