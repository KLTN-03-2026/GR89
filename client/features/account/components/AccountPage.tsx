'use client'
import { useState } from 'react'
import { useAuth } from '@/libs/contexts/AuthContext'
import HeaderBar from './sections/HeaderBar'
import SidebarNav from './sections/SidebarNav'
import ProfileTab from './sections/ProfileTab'
import SecurityTab from './sections/SecurityTab'
import OrdersTab from './sections/OrdersTab'
import { User, Shield } from 'lucide-react'
import { ClipboardList } from 'lucide-react'

interface TabItem { id: string; label: string; description: string; icon: React.ElementType }

export function AccountPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const { user } = useAuth()

  const tabs: TabItem[] = [
    { id: 'profile', label: 'Thông tin cá nhân', icon: User, description: 'Quản lý thông tin cá nhân' },
    { id: 'security', label: 'Mật khẩu', icon: Shield, description: 'Cập nhật mật khẩu' },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: ClipboardList, description: 'Giao dịch đã mua' }
  ]

  const handleSave = () => { setIsEditing(false) }
  const handleCancel = () => { setIsEditing(false) }

  const renderProfileTab = () => (
    <ProfileTab
      isEditing={isEditing}
      onEdit={() => setIsEditing(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      user={user ? { fullName: user.fullName, email: user.email, isVip: user.isVip } : null}
    />
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <HeaderBar />

      <div className="max-w-6xl mx-auto px-4 w-full sm:px-6 lg:px-8 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <SidebarNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </div>
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'orders' && <OrdersTab />}
          </div>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 EnglishMastery. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </div>
  )
}


