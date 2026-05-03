'use client'

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import { ROUTES } from "@/constants";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function AppSidebar() {
  const [openGroup, setOpenGroup] = useState<number | null>(null)
  const [heights, setHeights] = useState<{ [key: number]: number }>({})
  const contentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const [itemActive, setItemActive] = useState<string | null>('Tổng quan')
  const { user } = useAuth()

  // Lọc routes dựa trên role
  const getFilteredRoutes = useCallback(() => {
    if (user?.role === 'admin') {
      return ROUTES.SIDEBAR_ROUTES // Admin thấy tất cả
    }

    if (user?.role === 'content') {
      // Content manager chỉ thấy các menu liên quan đến nội dung
      return ROUTES.SIDEBAR_ROUTES.filter(group => {
        // Chỉ hiển thị các nhóm được phép
        const allowedGroups = [
          'Bảng điều khiển',
          'Quản lý học tập',
          'Thư viện nội dung',
          'Quản lý media',
          'Giải trí',
          'Trung tâm Đào tạo'
        ]
        return allowedGroups.includes(group.title)
      }).map(group => {
        // Lọc các sub-items trong mỗi nhóm
        if (group.title === 'Bảng điều khiển') {
          return {
            ...group,
            subItems: group.subItems.filter(item => item.title === 'Tổng quan')
          }
        }
        if (group.title === 'Quản lý học tập') {
          return {
            ...group,
            subItems: group.subItems.filter(item => item.title === 'Lộ trình học')
          }
        }
        return group
      })
    }

    return ROUTES.SIDEBAR_ROUTES // Fallback
  }, [user?.role])

  const handleGroupToggle = (groupIndex: number) => {
    if (openGroup === groupIndex) {
      setOpenGroup(null) // Đóng nhóm hiện tại
    } else {
      setOpenGroup(groupIndex) // Mở nhóm mới và đóng nhóm cũ
    }
  }

  // Đo chiều cao của mỗi nhóm khi component mount
  useEffect(() => {
    const newHeights: { [key: number]: number } = {}
    getFilteredRoutes().forEach((_, index) => {
      if (contentRefs.current[index]) {
        newHeights[index] = contentRefs.current[index]!.scrollHeight
      }
    })
    setHeights(newHeights)
  }, [getFilteredRoutes])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-4 py-2 transition-all duration-200 gap-3">
          <Image
            title="icon"
            src='/images/logo.png'
            alt="logo"
            width={60}
            height={60}
            className="min-w-32px min-h-32px w-10 h-10 object-contain"
          />

          <div>
            <h1 className="font-bold text-lg bg-linear-to-r from-[#FF6B35] to-[#4A90E2] bg-clip-text text-transparent">
              {user?.role === 'content' ? 'CONTENT' : 'ADMIN'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'content' ? 'Content Manager' : 'Admin'} ActiveLearning
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-3'>
        <SidebarGroup />
        <SidebarMenu>
          {getFilteredRoutes().map((routeGroup, groupIndex) => (
            <SidebarMenuItem key={groupIndex}>
              <SidebarMenuButton
                className="cursor-pointer font-semibold text-sm text-muted-foreground"
                tooltip={routeGroup.title}
                onClick={() => handleGroupToggle(groupIndex)}
              >
                <routeGroup.icon />
                <span>{routeGroup.title}</span>
                <ChevronRight
                  className={`ml-auto transition-transform duration-300 ease-in-out ${openGroup === groupIndex ? 'rotate-90' : ''
                    }`}
                />
              </SidebarMenuButton>

              <div
                ref={(el) => {
                  contentRefs.current[groupIndex] = el
                }}
                className="overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  height: openGroup === groupIndex ? `${heights[groupIndex] || 0}px` : '0px',
                  opacity: openGroup === groupIndex ? 1 : 0,
                }}
              >
                <SidebarMenuSub>
                  {routeGroup.subItems.map((item, itemIndex) => (
                    <SidebarMenuSubItem key={itemIndex}>
                      <SidebarMenuSubButton
                        className={`cursor-pointer ${itemActive === item.title ? 'bg-blue-700 text-white hover:bg-blue-600 hover:text-white' : ''}`}
                        asChild
                        onClick={() => setItemActive(item.title)}
                      >
                        <Link href={item.href}>
                          <item.icon className={`${itemActive === item.title ? 'stroke-white' : ''}`} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarGroup />
      </SidebarContent>
    </Sidebar >
  )
}