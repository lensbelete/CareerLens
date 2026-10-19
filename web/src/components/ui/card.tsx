export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-sm border border-line bg-white p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-ink sm:text-[2.15rem]">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="py-14 text-center">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    error: "border-[#ead8d4] bg-[#fbf6f5] text-[#7a2e24]",
    success: "border-[#d7e2d8] bg-[#f4f8f5] text-pine",
    info: "border-[#d7e2d8] bg-[#f4f8f5] text-pine",
  }[tone];
  return (
    <div className={`rounded-sm border px-3 py-2.5 text-sm ${styles}`} role="status">
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "teal" | "amber" | "rose" | "sample";
}) {
  const styles = {
    neutral: "border-line bg-white text-ink/80",
    teal: "border-[#d7e2d8] bg-[#f4f8f5] text-pine",
    amber: "border-line bg-white text-muted",
    rose: "border-[#ead8d4] bg-[#fbf6f5] text-[#7a2e24]",
    sample: "border-ink bg-ink text-cream",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-pine">
      {children}
    </p>
  );
}
