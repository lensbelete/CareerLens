import Link from "next/link";

export function Wordmark({
  href = "/",
  inverted = false,
}: {
  href?: string;
  inverted?: boolean;
}) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span
        className={`grid h-8 w-8 place-items-center border text-[11px] tracking-[0.18em] ${
          inverted
            ? "border-brass/50 text-brass"
            : "border-ink/80 text-ink"
        }`}
        aria-hidden
      >
        CL
      </span>
      <span
        className={`font-serif text-[1.35rem] leading-none ${
          inverted ? "text-cream" : "text-ink"
        }`}
      >
        CareerLens
      </span>
    </Link>
  );
}
