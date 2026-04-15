'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Ticket,
  Tag,
  FileText,
  BadgePercent,
  CalendarDays,
  Clock,
  Briefcase,
  CheckCircle2,
  Save,
  Loader2
} from "lucide-react"
import { createCoupon, Plan, Coupon } from "@/lib/apis/api"
import { toast } from "react-toastify"

interface SheetAddCouponProps {
  plans: Plan[]
  callback: () => void
}

export function SheetAddCoupon({ plans, callback }: SheetAddCouponProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([])
  const [draft, setDraft] = useState<Partial<Coupon>>({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchaseAmount: undefined,
    maxDiscountAmount: undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: undefined,
    isActive: true,
    applicablePlans: [],
    isFirstTimeOnly: false,
  })

  const handleSave = async () => {
    if (!draft.code || !draft.name || !draft.discountValue || !draft.validFrom || !draft.validTo) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }

    setLoading(true)
    const couponData = {
      ...draft,
      applicablePlans: selectedPlanIds.length > 0 ? selectedPlanIds : [],
      validFrom: new Date(draft.validFrom!).toISOString(),
      validTo: new Date(draft.validTo!).toISOString(),
    }

    await createCoupon(couponData as Coupon)
      .then(() => {
        toast.success('Tạo mã giảm giá thành công')
        setOpen(false)
        callback()
        // Reset form
        setDraft({
          code: "",
          name: "",
          description: "",
          discountType: "percentage",
          discountValue: 0,
          minPurchaseAmount: undefined,
          maxDiscountAmount: undefined,
          validFrom: new Date().toISOString().split('T')[0],
          validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          usageLimit: undefined,
          isActive: true,
          applicablePlans: [],
          isFirstTimeOnly: false,
        })
        setSelectedPlanIds([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="h-12 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all font-bold">
          <Plus className="w-4 h-4 mr-2" />
          Tạo mã mới
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full sm:max-w-3xl flex flex-col p-0 border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 shadow-inner">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <SheetTitle className="text-2xl font-black text-gray-900 tracking-tight">Thiết Kế Mã Mới</SheetTitle>
              <SheetDescription className="text-gray-500 font-medium mt-1">
                Tạo chương trình ưu đãi mới cho khách hàng.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Separator className="bg-gray-100" />

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-8 space-y-10">
            {/* Section: Basic Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-rose-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Tag className="w-4 h-4" />
                Thông Tin Định Danh
              </div>

              <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Mã Giảm Giá <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={draft.code}
                    onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-black px-4 shadow-sm uppercase"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Tên Chiến Dịch <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="VD: Ưu đãi mùa hè"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5 col-span-2">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Mô Tả
                  </Label>
                  <Textarea
                    className="bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-medium px-4 py-3 min-h-[80px] resize-none shadow-sm"
                    value={draft.description || ""}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Mô tả ngắn gọn về chương trình này..."
                  />
                </div>
              </div>
            </section>

            {/* Section: Discount Configuration */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-blue-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <BadgePercent className="w-4 h-4" />
                Cấu Hình Giảm Giá
              </div>

              <div className="grid grid-cols-2 gap-6 bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100/50">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Loại Giảm Giá</Label>
                  <Select
                    value={draft.discountType}
                    onValueChange={(v: 'percentage' | 'fixed') => setDraft({ ...draft, discountType: v })}
                  >
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold px-4 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      <SelectItem value="percentage" className="rounded-xl">Phần trăm (%)</SelectItem>
                      <SelectItem value="fixed" className="rounded-xl">Số tiền cố định (₫)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Giá Trị Giảm <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      type="number"
                      value={draft.discountValue}
                      onChange={(e) => setDraft({ ...draft, discountValue: Number(e.target.value) })}
                      placeholder={draft.discountType === 'percentage' ? "20" : "50000"}
                      className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-black px-4 shadow-sm"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-gray-400">
                      {draft.discountType === 'percentage' ? '%' : '₫'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Đơn tối thiểu</Label>
                  <Input
                    type="number"
                    value={draft.minPurchaseAmount || ""}
                    onChange={(e) => setDraft({ ...draft, minPurchaseAmount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="100.000"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Giảm tối đa</Label>
                  <Input
                    type="number"
                    value={draft.maxDiscountAmount || ""}
                    onChange={(e) => setDraft({ ...draft, maxDiscountAmount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="100.000"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-blue-500 font-bold px-4 shadow-sm"
                  />
                </div>
              </div>
            </section>

            {/* Section: Validity */}
            <section className="space-y-6">
              <div className="flex items-center gap-2.5 text-emerald-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <CalendarDays className="w-4 h-4" />
                Thời Gian Hiệu Lực
              </div>

              <div className="grid grid-cols-2 gap-6 bg-emerald-50/30 p-6 rounded-[2rem] border border-emerald-100/50">
                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Ngày Bắt Đầu <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
                    <Input
                      type="date"
                      value={draft.validFrom}
                      onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })}
                      className="h-12 pl-10 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                    Ngày Kết Thúc <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500/50" />
                    <Input
                      type="date"
                      value={draft.validTo}
                      onChange={(e) => setDraft({ ...draft, validTo: e.target.value })}
                      className="h-12 pl-10 bg-white border-gray-200 rounded-2xl focus:ring-rose-500 font-bold px-4 shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label className="text-xs font-black text-gray-500 uppercase ml-1">Giới Hạn Lượt Dùng</Label>
                  <Input
                    type="number"
                    value={draft.usageLimit || ""}
                    onChange={(e) => setDraft({ ...draft, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Vô hạn"
                    className="h-12 bg-white border-gray-200 rounded-2xl focus:ring-emerald-500 font-bold px-4 shadow-sm"
                  />
                </div>

                <div className="flex flex-col justify-center gap-3 px-4 pt-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isActive"
                      checked={draft.isActive}
                      onCheckedChange={(checked) => setDraft({ ...draft, isActive: !!checked })}
                      className="w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-emerald-600"
                    />
                    <Label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Kích hoạt ngay</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="isFirstTimeOnly"
                      checked={draft.isFirstTimeOnly}
                      onCheckedChange={(checked) => setDraft({ ...draft, isFirstTimeOnly: !!checked })}
                      className="w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-indigo-600"
                    />
                    <Label htmlFor="isFirstTimeOnly" className="text-sm font-bold text-gray-700 cursor-pointer">Chỉ cho người dùng mới</Label>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Applicable Plans */}
            <section className="space-y-6 pb-10">
              <div className="flex items-center gap-2.5 text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em]">
                <Briefcase className="w-4 h-4" />
                Áp Dụng Cho Gói
              </div>

              <div className="space-y-4 bg-indigo-50/30 p-6 rounded-[2rem] border border-indigo-100/50">
                <Label className="text-xs font-black text-gray-500 uppercase ml-1">Chọn Gói Dịch Vụ (Mặc định = Tất cả)</Label>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {plans.length === 0 ? (
                    <p className="text-xs text-muted-foreground animate-pulse col-span-2">Đang tải danh sách gói...</p>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm col-span-2">
                        <Checkbox
                          id="selectAllPlans"
                          checked={selectedPlanIds.length === plans.length && plans.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPlanIds(plans.map(p => p._id))
                            } else {
                              setSelectedPlanIds([])
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="selectAllPlans" className="text-xs font-black text-indigo-600 cursor-pointer uppercase tracking-tighter">
                          Chọn tất cả các gói
                        </Label>
                      </div>
                      {plans.map((plan) => (
                        <div key={plan._id} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 transition-colors">
                          <Checkbox
                            id={`plan-${plan._id}`}
                            checked={selectedPlanIds.includes(plan._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPlanIds([...selectedPlanIds, plan._id])
                              } else {
                                setSelectedPlanIds(selectedPlanIds.filter(id => id !== plan._id))
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`plan-${plan._id}`} className="text-xs font-bold text-gray-600 cursor-pointer truncate">
                            {plan.name} {plan.billingCycle && `(${plan.billingCycle})`}
                          </Label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                {selectedPlanIds.length > 0 && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 bg-indigo-100/50 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã chọn {selectedPlanIds.length} gói dịch vụ áp dụng.
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>

        <Separator className="bg-gray-100" />

        <SheetFooter className="p-8 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100">
          <div className="flex items-center justify-end gap-4 w-full">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-12 px-8 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-white transition-all active:scale-95"
            >
              Hủy Bỏ
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="h-12 px-10 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 font-black transition-all active:scale-95"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              {loading ? 'Đang Xử Lý...' : 'Phát Hành Mã'}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
