import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-pine text-cream hover:bg-ink disabled:bg-pine/50",
  secondary:
    "border border-line bg-cream text-ink hover:border-ink/40 disabled:text-muted",
  ghost: "text-ink/80 hover:bg-ink/5 disabled:text-muted",
  danger: "bg-[#7a2e24] text-cream hover:bg-[#5f221c] disabled:bg-[#7a2e24]/50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-[13px] font-medium tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
