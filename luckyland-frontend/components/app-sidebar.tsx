"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROLE_LABELS } from "@/lib/mock-data";
import { MODULE_META } from "@/lib/modules";
import { modulesForRole, useStore } from "@/lib/store";
import type { ModuleKey } from "@/lib/types";

export function AppSidebar({
  active,
  onSelect,
}: {
  active: ModuleKey;
  onSelect: (m: ModuleKey) => void;
}) {
  const { user, logout } = useStore();
  if (!user) return null;
  const modules = modulesForRole(user.role);

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/15 overflow-hidden">
            <Image
              src="/lucky-land-logo.jpg"
              alt="Lucky Land"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-base font-bold leading-tight text-sidebar-foreground">
              Lucky Land
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              Operational System
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Modul</SidebarGroupLabel>
          <SidebarMenu>
            {modules.map((key) => {
              const meta = MODULE_META[key];
              const Icon = meta.icon;
              return (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    isActive={active === key}
                    onClick={() => onSelect(key)}
                    tooltip={meta.label}
                  >
                    <Icon className="size-4" />
                    <span>{meta.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {user.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Keluar"
            className="rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
