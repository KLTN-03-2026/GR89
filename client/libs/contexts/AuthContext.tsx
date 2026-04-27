'use client'

import { User } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { login, loginGoogle, logout, register } from '@/features/auth/services/authApi'
import { getMyProfile, updateMyAvatar, updateMyProfile } from '@/features/account/services/accountApi'
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthorizedAxios } from "../apis/authorizedAxios";

interface LoginRequest {
  email: string
  password: string
}
interface RegisterRequest {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  loginGoogle: () => void
  logout: () => void
  register: (credentials: RegisterRequest) => Promise<void>
  refreshProfile: () => Promise<void>
  updateUser: (userData: User) => Promise<void>
  updateAvatar: (file: File) => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => { },
  loginGoogle: () => { },
  logout: () => { },
  register: async () => { },
  refreshProfile: async () => { },
  updateUser: async () => { },
  updateAvatar: async () => { }
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const currentPath = usePathname()
  const isCurrentPathAuth = currentPath === '/login' || currentPath === '/register' || currentPath === '/'
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(isCurrentPathAuth ? false : true)
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      const raw = localStorage.getItem('user')
      if (raw) {
        setUser(JSON.parse(raw) as User)
        setIsLoading(false)
        return
      }
    }

    if (isCurrentPathAuth || !!user) {
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)
    getMyProfile()
      .then((res) => {
        if (!cancelled) setUser(res.data as User)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentPath, isCurrentPathAuth, user])

  const loginUser = async (credentials: LoginRequest) => {
    setIsLoading(true)
    await login(credentials)
      .then((res) => {
        setUser(res.data)
        localStorage.setItem('user', JSON.stringify(res.data))
        toast.success('Đăng nhập thành công')
        router.push('/dashboard')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleLoginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await loginGoogle(tokenResponse.access_token)
        .then(res => {
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
          router.push('/dashboard')
          toast.success(res.message)
        })
    },
    onError: error => console.log(error)
  })

  const logoutUser = async () => {
    setIsLoading(true)
    await logout()
      .then(async () => {
        await AuthorizedAxios.post('/auth/logout', { role: 'user' })
          .then(() => {
            router.push('/')
            setUser(null)
            localStorage.removeItem('user')
            toast.success('Đăng xuất thành công')
          })
          .finally(() => {
            setIsLoading(false)
          })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const registerUser = async (credentials: RegisterRequest) => {
    setIsLoading(true)
    await register(credentials)
      .then((res) => {
        toast.success(res.message)
        localStorage.setItem('user', JSON.stringify(res.data))
        router.push('/dashboard')
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || error?.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const refreshProfile = async () => {
    setIsLoading(true)
    await getMyProfile()
      .then((res) => {
        setUser(res.data as User)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const updateUser = async (userData: User) => {
    setIsLoading(true)
    await updateMyProfile(userData as User)
      .then((res) => {
        setUser(res.data as User)
        localStorage.setItem('user', JSON.stringify(res.data))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const updateAvatar = async (file: File) => {
    setIsLoading(true)
    await updateMyAvatar(file)
      .then(res => {
        if (res.success && res.data) {
          setUser(res.data as User)
          localStorage.setItem('user', JSON.stringify(res.data))
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login: loginUser, loginGoogle: handleLoginGoogle, logout: logoutUser, register: registerUser, refreshProfile, updateUser, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext);
} 