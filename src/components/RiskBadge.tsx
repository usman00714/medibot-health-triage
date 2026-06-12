const styles: Record<string, string> = {
  Low: "bg-[color:var(--color-risk-low)] text-white",
  Medium: "bg-[color:var(--color-risk-medium)] text-black",
  High: "bg-[color:var(--color-risk-high)] text-white",
  Critical: "bg-[color:var(--color-risk-critical)] text-white",
};

export function RiskBadge({ level }: { level: string | null | undefined }) {
  if (!level) return null;
  const cls = styles[level] ?? "bg-muted text-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {level} Risk
    </span>
  );
}
