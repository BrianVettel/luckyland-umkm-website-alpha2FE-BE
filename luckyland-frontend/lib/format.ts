export function rupiah(value: number | null | undefined) {
  if (value === null || value === undefined || isNaN(value)) {
    return "Rp 0"
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

export function shortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

export function fullDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
