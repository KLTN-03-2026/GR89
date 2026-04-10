'use client'

import { User } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { login, loginGoogle, logout, register } from '@/features/auth/services/authApi'
import { getMyProfile } from '@/features/account/services/accountApi'
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";

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
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => { },
  loginGoogle: () => { },
  logout: () => { },
  register: async () => { },
  refreshProfile: async () => { }
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const currentPath = usePathname()
  const isCurrentPathAuth = currentPath === '/login' || currentPath === '/register'
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(isCurrentPathAuth ? false : true)
  const router = useRouter();

  useEffect(() => {
    console.log('vào đây chưa')
    const fetchUser = async () => {
      if (isCurrentPathAuth) {
        setIsLoading(false)
        return;
      }
      setIsLoading(true)
      await getMyProfile()
        .then((res) => {
          setUser(res.data as User)
        })
        .catch(() => {
          setUser(null)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }

    fetchUser()
  }, [isCurrentPathAuth, user]);

  const loginUser = async (credentials: LoginRequest) => {
    setIsLoading(true)
    await login(credentials)
      .then((res) => {
        setUser(res.data)
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
          console.log(res)
          setUser(res.data)
          router.push('/dashboard')
          toast.success(res.message)
        })
    },
    onError: error => console.log(error)
  })

  const logoutUser = async () => {
    await logout()
      .then(() => {
        setUser(null)
        toast.success('Đăng xuất thành công')
        router.push('/')
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
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login: loginUser, loginGoogle: handleLoginGoogle, logout: logoutUser, register: registerUser, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext);
}