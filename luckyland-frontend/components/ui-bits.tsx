"use client";

import type { ReactNode } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
}) {
  const toneClass = {
    primary: "bg-primary/10 text-primary",
    success: "bg-chart-3/15 text-chart-3",
    warning: "bg-chart-4/25 text-accent-foreground",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-chart-5/15 text-chart-5",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-heading text-lg font-semibold leading-normal">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              toneClass,
            )}
          >
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExportButtons({ label = "laporan" }: { label?: string }) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.success(`Ekspor Excel ${label} dimulai`)}
      >
        <FileSpreadsheet className="size-4" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.success(`Ekspor PDF ${label} dimulai`)}
      >
        <Download className="size-4" />
        PDF
      </Button>
    </div>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-10 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
