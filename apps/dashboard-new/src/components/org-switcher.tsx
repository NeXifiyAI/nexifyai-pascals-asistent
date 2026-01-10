"use client";

import { Sparkles } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function OrgSwitcher() {
  const { state } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <Sparkles className="size-4" />
          </div>
          <div
            className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
              state === "collapsed"
                ? "invisible max-w-0 overflow-hidden opacity-0"
                : "visible max-w-full opacity-100"
            }`}
          >
            <span className="truncate font-semibold">NeXify AI</span>
            <span className="text-muted-foreground truncate text-xs">
              Pascals Assistent
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
