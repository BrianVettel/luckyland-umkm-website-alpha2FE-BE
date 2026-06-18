"use client";

import { useEffect, useState } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { LoginScreen } from "@/components/login-screen";
import { MODULE_META } from "@/lib/modules";
import { modulesForRole, useStore } from "@/lib/store";
import type { ModuleKey } from "@/lib/types";
import { DashboardModule } from "@/components/modules/dashboard-module";
import { PosModule } from "@/components/modules/pos-module";
import { ProductionModule } from "@/components/modules/production-module";
import { LeaveModule } from "@/components/modules/leave-module";
import { PayrollModule } from "@/components/modules/payroll-module";
import { MaterialsModule } from "@/components/modules/materials-module";
import { EquipmentModule } from "@/components/modules/equipment-module";

export function AppShell() {
  const { user } = useStore();
  const [active, setActive] = useState<ModuleKey>("dashboard");

  useEffect(() => {
    if (!user) return;
    const allowed = modulesForRole(user.role);
    setActive((cur) => (allowed.includes(cur) ? cur : allowed[0]));
  }, [user]);

  if (!user) return <LoginScreen />;

  const meta = MODULE_META[active];

  return (
    <SidebarProvider>
      <AppSidebar active={active} onSelect={setActive} />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold leading-tight">
                {meta.label}
              </h1>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {meta.description}
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          {active === "dashboard" && <DashboardModule />}
          {active === "pos" && <PosModule />}
          {active === "production" && <ProductionModule />}
          {active === "leave" && <LeaveModule />}
          {active === "payroll" && <PayrollModule />}
          {active === "materials" && <MaterialsModule />}
          {active === "equipment" && <EquipmentModule />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
