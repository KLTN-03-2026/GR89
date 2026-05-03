'use client'

import { GoogleIcon, FacebookIconColor } from "@/components/common/icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/libs/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { useAuth } from "@/libs/contexts/AuthContext";
import FacebookLogin from '@greatsumini/react-facebook-login';

export function FormLogin() {
  const { login, isLoading, loginGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(formData)
  }

  return (
    <TabsContent value="login" className="space-y-4">
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-gray-700 font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="login-email"
              type="email"
              placeholder="your.email@example.com"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 h-12 border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-all duration-300 w-full"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-password" className="text-gray-700 font-medium">
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 h-12 border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-all duration-300"
              required
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]"
            />
            <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
          </label>

          <ForgotPasswordModal />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#3B82F6] hover:bg-blue-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang đăng nhập...</span>
            </div>
          ) : (
            "Đăng nhập"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* <Button
          variant="outline"
          className="h-12 border-gray-200 hover:bg-gray-50 transition-all duration-300 bg-transparent"
        >
          <GoogleIcon />
          Google
        </Button> */}

        <Button
          variant="outline"
          className="h-12 border-gray-200 hover:bg-gray-50 transition-all duration-300 bg-transparent"
          onClick={() => loginGoogle()}
        >
          <GoogleIcon />
          Google
        </Button>

        <div
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 border-gray-200 hover:bg-gray-50 transition-all duration-300 bg-transparent p-0"
          )}
        >
          <FacebookLogin
            className="flex h-full w-full items-center justify-center gap-2 rounded-md"
            appId={process.env.FACEBOOK_API_CLIENT_ID || ''}
            onSuccess={(response) => {
              console.log('Login Success!', response);
            }}
            onFail={(error) => {
              console.log('Login Failed!', error);
            }}
            onProfileSuccess={(response) => {
              console.log('Get Profile Success!', response);
            }}
          >
            <FacebookIconColor />
            Facebook
          </FacebookLogin>
        </div>
      </div>


    </TabsContent>
  )
}
