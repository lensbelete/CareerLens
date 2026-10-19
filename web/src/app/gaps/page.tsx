"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import { scoreTone } from "@/lib/format";
import type { SkillGapsResponse } from "@/types/api";

function GapsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [data, setData] = useState<SkillGapsResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const path = jobId ? `/skills/gaps?jobId=${jobId}` : "/skills/gaps";
    apiFetch<SkillGapsResponse>(path)
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load skill gaps"),
      );
  }, [jobId]);

  return (
    <>
      <PageHeader
        title="Skill-gap analysis"
        description="Recommendations are generated from job requirements and your current profile. They are deterministic, not LLM copy."
      />
      {error ? <Alert>{error}</Alert> : null}
      {!data ? (
        <p className="text-sm text-muted">Comparing your profile with jobs…</p>
      ) : data.match && data.job ? (
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold">{data.job.title}</h2>
            <p className="text-sm text-muted">{data.job.company}</p>
            <p className="mt-3 text-sm leading-6">{data.match.explanation}</p>
          </Card>
          {data.match.recommendations.length === 0 ? (
            <EmptyState
              title="No gaps on this listing"
              description="Every required and preferred skill is evidenced on the profile or CV."
            />
          ) : (
            data.match.recommendations.map((item) => (
              <Card key={`${item.kind}-${item.skill}`}>
                <div className="flex items-center gap-2">
                  <span className="capitalize font-medium">{item.skill}</span>
                  <Badge tone={item.kind === "required" ? "rose" : "amber"}>
                    {item.kind}
                  </Badge>
                  <Badge>{item.generatedBy}</Badge>
                </div>
                <p className="mt-2 text-sm text-ink/80">{item.suggestion}</p>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
              Most frequent missing skills
            </h2>
            {data.aggregated && data.aggregated.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {data.aggregated.slice(0, 12).map((item) => (
                  <li key={item.skill} className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {item.skill}{" "}
                      <Badge tone={item.kind === "required" ? "rose" : "neutral"}>
                        {item.kind}
                      </Badge>
                    </span>
                    <span className="text-muted">{item.jobTitles.length} jobs</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">No catalogue to compare yet.</p>
            )}
          </Card>
          <div className="grid gap-3">
            {(data.perJob ?? []).map((row) => (
              <Card key={row.job.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/jobs/${row.job.id}`} className="font-semibold hover:underline">
                      {row.job.title}
                    </Link>
                    <p className="text-sm text-muted">{row.job.company}</p>
                  </div>
                  <span className={`rounded px-2 py-1 text-sm font-semibold tabular-nums ${scoreTone(row.score)}`}>
                    {row.score}
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink/80">
                  Missing required:{" "}
                  {row.missingRequired.length
                    ? row.missingRequired.map((item) => item.skill).join(", ")
                    : "none"}
                </p>
                <Link
                  href={`/gaps?jobId=${row.job.id}`}
                  className="mt-2 inline-block text-sm font-medium text-brass"
                >
                  Recommendations for this role
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function GapsPage() {
  return (
    <AppShell>
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <GapsContent />
      </Suspense>
    </AppShell>
  );
}
