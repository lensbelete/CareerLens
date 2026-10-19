import Link from "next/link";
import { Badge } from "@/components/ui/card";
import { employmentLabel, formatDate } from "@/lib/format";
import type { Job } from "@/types/api";

export function JobCard({
  job,
  score,
}: {
  job: Job;
  score?: number;
}) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-sm border border-line bg-cream/90 p-5 transition-colors hover:border-brass/70"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ink group-hover:text-pine">
            {job.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {job.company}
            <span className="mx-2 text-line">/</span>
            {job.location}
            <span className="mx-2 text-line">/</span>
            {employmentLabel(job.employmentType)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {job.source === "sample" ? <Badge tone="sample">Sample</Badge> : null}
          {typeof score === "number" ? (
            <span className="font-serif text-2xl tabular-nums text-ink">{score}</span>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.requiredSkills.slice(0, 6).map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">
        Added {formatDate(job.createdAt)}
      </p>
    </Link>
  );
}
