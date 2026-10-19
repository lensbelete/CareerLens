export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function employmentLabel(value: string): string {
  return value.replace("-", " ");
}

export function scoreTone(score: number): string {
  if (score >= 70) return "text-teal-800 bg-teal-50";
  if (score >= 45) return "text-amber-800 bg-amber-50";
  return "text-rose-800 bg-rose-50";
}
