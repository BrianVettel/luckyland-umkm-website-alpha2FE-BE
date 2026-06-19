import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "progress"

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  info: "bg-chart-5/15 text-chart-5 border-transparent",
  success: "bg-chart-3/15 text-chart-3 border-transparent",
  warning: "bg-chart-4/25 text-accent-foreground border-transparent",
  danger: "bg-destructive/15 text-destructive border-transparent",
  progress: "bg-primary/15 text-primary border-transparent",
}

const LABELS: Record<string, { label: string; tone: Tone }> = {
  // payment
  pending: { label: "Pending", tone: "warning" },
  verified: { label: "Verified", tone: "info" },
  lunas: { label: "Lunas", tone: "success" },
  // order
  draft: { label: "Draft", tone: "neutral" },
  cancelled: { label: "Dibatalkan", tone: "danger" },
  // production
  in_progress: { label: "In Progress", tone: "progress" },
  dough_ready: { label: "Dough Ready", tone: "info" },
  decorating: { label: "Decorating", tone: "warning" },
  finished: { label: "Finished", tone: "success" },
  // requests
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  calculated: { label: "Dihitung", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  // stock
  available: { label: "Tersedia", tone: "success" },
  low: { label: "Stok Menipis", tone: "warning" },
  out: { label: "Habis", tone: "danger" },
  in_use: { label: "Dipakai", tone: "info" },
  broken: { label: "Rusak", tone: "danger" },
  // condition
  good: { label: "Baik", tone: "success" },
  minor: { label: "Rusak Ringan", tone: "warning" },
  heavy: { label: "Rusak Berat", tone: "danger" },
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const cfg = LABELS[status] ?? { label: status, tone: "neutral" as Tone }
  return (
    <Badge className={cn("font-medium", TONE_CLASS[cfg.tone], className)}>
      {cfg.label}
    </Badge>
  )
}
