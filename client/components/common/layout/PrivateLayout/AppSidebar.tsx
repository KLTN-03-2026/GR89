'use client'

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { ISidebarRoute, ISidebarRouteGroup, ROUTES } from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavUser } from "./NavUser";

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={`flex items-center px-4 py-2 transition-all duration-200 ${collapsed ? "justify-center" : "gap-3"}`}>
          <Image
            title="logo"
            src='/images/logo.png'
            alt="logo"
            width={70}
            height={70}
            className="min-w-[32px] min-h-[32px] w-12 h-12 object-contain"
          />

          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-[#FF6B35] to-[#4A90E2] bg-clip-text text-transparent">
                ActiveLearning
              </h1>
              <p className="text-xs text-muted-foreground">Learn English Smart</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {ROUTES.SIDEBAR_ROUTES.map((router: ISidebarRouteGroup) => (
          <SidebarGroup className={`${collapsed ? "p-0" : ""}`} key={router.title}>
            <SidebarGroupLabel className="font-semibold text-accent text-sm tracking-wider flex items-center gap-2 mb-2">
              <router.icon className="size-3 text-accent" />
              {router.title.charAt(0).toUpperCase() + router.title.slice(1).toLowerCase()}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {router.items.map((item: ISidebarRoute) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton className="my-1" asChild isActive={pathname === item.url}>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 hover:scale-[1.02] transition-all duration-300`}
                      >
                        <div className={`w-8 h-8 p-2 rounded-lg bg-gradient-to-br ${item.gradient} text-white shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center justify-center`}>
                          <item.icon className="size-4" />
                        </div>

                        <span className="font-medium hover:text-primary transition-colors duration-300 flex-1">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
