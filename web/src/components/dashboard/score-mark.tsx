export function ScoreMark({
  score,
  size = "md",
}: {
  score: number;
  size?: "md" | "lg";
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 70 ? "var(--moss)" : clamped >= 45 ? "var(--pine)" : "var(--clay)";
  const wrap = size === "lg" ? "h-24 w-24" : "h-14 w-14";
  const inner = size === "lg" ? "h-[4.75rem] w-[4.75rem] text-3xl" : "h-11 w-11 text-lg";

  return (
    <span
      className={`relative grid place-items-center rounded-full ${wrap}`}
      style={{
        background: `conic-gradient(${color} ${clamped * 3.6}deg, rgba(22,19,15,0.08) 0)`,
      }}
      aria-label={`Match score ${clamped}`}
    >
      <span
        className={`grid place-items-center rounded-full bg-white font-serif tabular-nums text-ink ${inner}`}
      >
        {clamped}
      </span>
    </span>
  );
}
