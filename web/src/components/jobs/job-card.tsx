import Link from "next/link";
import { ScoreMark } from "@/components/dashboard/score-mark";
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
      className="group block rounded-2xl border border-line bg-white p-5 transition-colors hover:border-pine/30"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">{job.title}</h2>
          <p className="mt-1 text-sm text-ink/70">
            {job.company}
            <span className="mx-2 opacity-40">/</span>
            {job.location}
            <span className="mx-2 opacity-40">/</span>
            {employmentLabel(job.employmentType)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {job.source === "sample" ? <Badge tone="sample">Sample</Badge> : null}
          {typeof score === "number" ? <ScoreMark score={score} /> : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {job.requiredSkills.slice(0, 6).map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-ink/55">
        Added {formatDate(job.createdAt)}
      </p>
    </Link>
  );
}
