"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { Alert, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import { scoreTone } from "@/lib/format";
import type { DashboardSummary } from "@/types/api";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DashboardSummary>("/dashboard")
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load dashboard"),
      );
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Counts come from your saved jobs, applications, and live match scores against the current catalogue."
      />
      {error ? <Alert>{error}</Alert> : null}
      {!data && !error ? <p className="text-sm text-muted">Loading dashboard…</p> : null}
      {data ? (
        <div className="space-y-6">
          {!data.profileReady ? (
            <Alert tone="info">
              Add skills or experience on your{" "}
              <Link href="/profile" className="font-medium underline">
                profile
              </Link>{" "}
              or upload a{" "}
              <Link href="/resumes" className="font-medium underline">
                CV
              </Link>{" "}
              so matches have something to compare.
            </Alert>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Relevant matches", data.totals.relevantMatches, "Score ≥ 50"],
              ["Saved jobs", data.totals.savedJobs, "Bookmarks"],
              ["Active applications", data.totals.activeApplications, "Applied + interview"],
              ["Interviews", data.totals.interviews, "Current pipeline"],
              ["Offers", data.totals.offers, "Recorded offers"],
            ].map(([label, value, hint]) => (
              <Card key={label}>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  {label}
                </p>
                <p className="mt-3 font-serif text-4xl tabular-nums text-ink">{value}</p>
                <p className="mt-1 text-xs text-muted">{hint}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Recommended from current jobs
              </h2>
              {data.recommended.length === 0 ? (
                <EmptyState
                  title="No jobs yet"
                  description="Seed the sample catalogue or add a job manually."
                  action={
                    <Link href="/jobs" className="text-sm font-medium text-brass">
                      Open jobs
                    </Link>
                  }
                />
              ) : (
                data.recommended.map((item) => (
                  <JobCard key={item.job.id} job={item.job} score={item.score} />
                ))
              )}
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Recurring skill gaps
              </h2>
              <Card>
                {data.skillGaps.length === 0 ? (
                  <p className="text-sm text-muted">
                    No structured gaps yet. Upload a CV or wait until jobs are seeded.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.skillGaps.map((gap) => (
                      <li key={gap.skill} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{gap.skill}</span>
                        <span className={`rounded px-2 py-0.5 text-xs ${scoreTone(40)}`}>
                          {gap.jobCount} listings
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link href="/gaps" className="mt-4 inline-block text-sm font-medium text-brass">
                  Full gap analysis
                </Link>
              </Card>
              <Card>
                <h3 className="text-sm font-semibold">Recently added jobs</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {data.recentJobs.map((job) => (
                    <li key={job.id}>
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        {job.title}
                      </Link>
                      <span className="text-muted"> · {job.company}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
