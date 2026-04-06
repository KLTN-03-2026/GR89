'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/libs/contexts/AuthContext";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

export function FormSignup() {
  const { register, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register(formData)
  }

  return (
    <TabsContent value="signup" className="space-y-4">
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name" className="text-gray-700 font-medium">
            Họ và tên
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="signup-name"
              type="text"
              placeholder="Nguyễn Văn A"
              className="pl-10 h-12 border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-all duration-300"
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-gray-700 font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="signup-email"
              type="email"
              placeholder="your.email@example.com"
              className="pl-10 h-12 border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-all duration-300"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-gray-700 font-medium">
            Mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 h-12 border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-all duration-300"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
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

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
            Xác nhận mật khẩu
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10 h-12 border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-all duration-300"
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6]"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
            Tôi đồng ý với{" "}
            <button type="button" className="text-[#3B82F6] hover:text-blue-700 font-medium">
              Điều khoản sử dụng
            </button>{" "}
            và{" "}
            <button type="button" className="text-[#3B82F6] hover:text-blue-700 font-medium">
              Chính sách bảo mật
            </button>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#3B82F6] hover:bg-blue-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tạo tài khoản...</span>
            </div>
          ) : (
            "Tạo tài khoản"
          )}
        </Button>
      </form>
    </TabsContent>
  )
}
