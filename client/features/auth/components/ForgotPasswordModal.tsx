'use client'

import { Dialog, DialogTitle, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Mail } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { requestPasswordReset } from '@/features/auth/services/authApi'

export function ForgotPasswordModal() {
  const [resetEmail, setResetEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "success">("email")

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (resetEmail.trim() === "") {
      toast.error("Vui lòng nhập email")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      toast.error("Email không hợp lệ")
      return
    }
    setIsLoading(true)
    await requestPasswordReset(resetEmail)
      .then(() => {
        setForgotPasswordStep("success")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const resetForgotPassword = () => {
    setForgotPasswordStep("email")
    setResetEmail("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Quên mật khẩu?
        </button>
      </DialogTrigger>

      <DialogContent>
        {forgotPasswordStep === "email" ? (
          <>
            <DialogHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-center text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</DialogTitle>
              <DialogDescription className="text-center text-gray-600">Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu</DialogDescription>
            </DialogHeader>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-[#3B82F6] focus:ring-[#3B82F6] transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <DialogFooter className="flex space-x-3 pt-4">
                <DialogClose
                  type="button"
                  onClick={resetForgotPassword}
                  className="flex-1 h-12 border-gray-200 hover:bg-gray-50 transition-all duration-300 bg-transparent"
                  disabled={isLoading}
                >
                  Hủy
                </DialogClose>

                <Button
                  disabled={isLoading}
                  className="flex-1 h-12 bg-[#3B82F6] hover:bg-blue-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100"
                  onClick={handleForgotPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    "Gửi link đặt lại"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Email đã được gửi!</h3>
            <p className="text-gray-600 mb-6">
              Chúng tôi đã gửi link đặt lại mật khẩu đến email <br />
              <span className="font-semibold text-[#3B82F6]">{resetEmail}</span>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-blue-600 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-blue-800 font-medium mb-1">Lưu ý:</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Kiểm tra cả hộp thư spam/junk</li>
                    <li>• Link có hiệu lực trong 15 phút</li>
                    <li>• Nếu không nhận được, thử lại sau 1 phút</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setForgotPasswordStep("email")}
                className="flex-1 h-12 border-gray-200 hover:bg-gray-50 transition-all duration-300"
              >
                Gửi lại
              </Button>
              <DialogClose
                type="button"
                onClick={resetForgotPassword}
                className="flex-1 h-12 bg-[#3B82F6] hover:bg-blue-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.02]"
              >
                Đóng
              </DialogClose>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
