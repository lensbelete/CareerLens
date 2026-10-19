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
      className="block rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-colors hover:border-teal-800"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-950">{job.title}</h2>
          <p className="mt-1 text-sm text-stone-600">
            {job.company} · {job.location} · {employmentLabel(job.employmentType)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {job.source === "sample" ? <Badge tone="sample">Sample</Badge> : null}
          {typeof score === "number" ? (
            <span className="rounded-md bg-stone-100 px-2 py-1 text-sm font-semibold tabular-nums">
              {score}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.requiredSkills.slice(0, 6).map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone-500">Added {formatDate(job.createdAt)}</p>
    </Link>
  );
}
