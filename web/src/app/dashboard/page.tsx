"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ScoreMark } from "@/components/dashboard/score-mark";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, Badge } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import { employmentLabel } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import type { ApplicationStatus, DashboardSummary } from "@/types/api";

const STATS: Array<{
  key: keyof DashboardSummary["totals"];
  label: string;
  hint: string;
}> = [
  { key: "relevantMatches", label: "Strong matches", hint: "Score ≥ 50" },
  { key: "savedJobs", label: "Saved", hint: "Bookmarks" },
  { key: "activeApplications", label: "In motion", hint: "Applied + interview" },
  { key: "interviews", label: "Interviews", hint: "Live conversations" },
  { key: "offers", label: "Offers", hint: "On the table" },
];

const PIPELINE: Array<{
  status: ApplicationStatus;
  label: string;
}> = [
  { status: "saved", label: "Saved" },
  { status: "applied", label: "Applied" },
  { status: "interview", label: "Interview" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

const ACTIONS = [
  { href: "/jobs", label: "Browse catalogue" },
  { href: "/resumes", label: "Upload a CV" },
  { href: "/applications", label: "Open pipeline" },
  { href: "/gaps", label: "Close skill gaps" },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DashboardSummary>("/dashboard")
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load dashboard"),
      );
  }, []);

  const firstName = user?.fullName.split(" ")[0] ?? "there";
  const featured = data?.recommended[0];
  const rest = data?.recommended.slice(1) ?? [];
  const pipelineMax = data
    ? Math.max(1, ...PIPELINE.map((item) => data.applicationCounts[item.status]))
    : 1;
  const maxGap = Math.max(1, ...(data?.skillGaps.map((gap) => gap.jobCount) ?? [1]));

  return (
    <AppShell>
      {error ? <Alert>{error}</Alert> : null}
      {!data && !error ? (
        <p className="text-sm text-muted">Loading your search board…</p>
      ) : null}
      {data ? (
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-3xl bg-pine px-6 py-8 text-cream sm:px-10 sm:py-10">
            <span className="dash-blob absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <span
              className="dash-blob absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/5"
              style={{ animationDelay: "-3s" }}
            />
            <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-cream/55">
                  Today on CareerLens
                </p>
                <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[1.05] sm:text-6xl">
                  Keep going, {firstName}.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-cream/75">
                  {data.totals.relevantMatches} roles currently look like a real overlap,
                  and {data.totals.activeApplications} applications are in motion. The board
                  below is your live search — not a static mock.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {ACTIONS.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className="rounded-full border border-cream/25 bg-cream/10 px-4 py-2 text-sm font-medium text-cream hover:bg-cream/20"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl bg-cream/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cream/60">
                  Strong matches right now
                </p>
                <p className="mt-2 font-serif text-7xl tabular-nums leading-none">
                  {data.totals.relevantMatches}
                </p>
                <p className="mt-3 text-sm text-cream/70">
                  {data.totals.interviews} interview
                  {data.totals.interviews === 1 ? "" : "s"} · {data.totals.offers} offer
                  {data.totals.offers === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </section>

          {!data.profileReady ? (
            <Alert tone="info">
              Add skills on your{" "}
              <Link href="/profile" className="font-medium underline">
                profile
              </Link>{" "}
              or upload a{" "}
              <Link href="/resumes" className="font-medium underline">
                CV
              </Link>{" "}
              so these matches have something to chew on.
            </Alert>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {STATS.map((stat) => (
              <section
                key={stat.key}
                className="rounded-2xl border border-line bg-white p-5"
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </p>
                <p className="mt-3 font-serif text-5xl tabular-nums text-pine">
                  {data.totals[stat.key]}
                </p>
                <p className="mt-1 text-xs text-muted">{stat.hint}</p>
              </section>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {PIPELINE.map((item) => {
              const count = data.applicationCounts[item.status];
              const height = Math.max(18, (count / pipelineMax) * 100);
              return (
                <section
                  key={item.status}
                  className="flex min-h-44 flex-col justify-end overflow-hidden rounded-2xl border border-line bg-white p-4"
                >
                  <div className="mb-3 flex h-24 items-end">
                    <div
                      className="dash-fill w-full rounded-2xl bg-pine"
                      style={{
                        height: `${height}%`,
                        opacity: item.status === "rejected" ? 0.35 : 1,
                      }}
                    />
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ink/70">
                    {item.label}
                  </p>
                  <p className="font-serif text-4xl tabular-nums text-ink">{count}</p>
                </section>
              );
            })}
          </div>

          {featured ? (
            <Link
              href={`/jobs/${featured.job.id}`}
              className="block overflow-hidden rounded-2xl bg-pine p-6 text-cream sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-cream/55">
                    Best overlap right now
                  </p>
                  <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                    {featured.job.title}
                  </h2>
                  <p className="mt-3 text-lg text-cream/75">
                    {featured.job.company} · {featured.job.location} ·{" "}
                    {employmentLabel(featured.job.employmentType)}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {featured.job.requiredSkills.slice(0, 8).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-cream/15 px-3 py-1 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  {featured.missingRequired.length > 0 ? (
                    <p className="mt-5 text-sm text-cream/70">
                      Still missing:{" "}
                      {featured.missingRequired.map((item) => item.skill).join(", ")}
                    </p>
                  ) : (
                    <p className="mt-5 text-sm text-cream/70">
                      Required skills are evidenced on your profile.
                    </p>
                  )}
                </div>
                <div className="rounded-full bg-white p-2">
                  <ScoreMark score={featured.score} size="lg" />
                </div>
              </div>
            </Link>
          ) : (
            <section className="rounded-2xl border border-line bg-white px-6 py-12 text-center">
              <h2 className="font-serif text-3xl">The catalogue is quiet</h2>
              <p className="mt-2 text-muted">Seed sample jobs or add one by hand.</p>
              <Link
                href="/jobs"
                className="mt-5 inline-block rounded-full bg-ink px-5 py-2 text-sm text-cream"
              >
                Open jobs
              </Link>
            </section>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h2 className="font-serif text-3xl">More worth opening</h2>
              {rest.length === 0 && featured ? (
                <p className="text-sm text-muted">
                  That featured role is the only strong suggestion right now.
                </p>
              ) : null}
              {rest.map((item) => {
                return (
                  <Link
                    key={item.job.id}
                    href={`/jobs/${item.job.id}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 hover:border-pine/30"
                  >
                    <div>
                      <p className="font-serif text-2xl">{item.job.title}</p>
                      <p className="mt-1 text-sm text-ink/70">
                        {item.job.company} · {item.job.location}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.job.requiredSkills.slice(0, 4).map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <ScoreMark score={item.score} />
                  </Link>
                );
              })}
            </div>

            <div className="space-y-4">
              <section className="rounded-2xl border border-line bg-white p-5">
                <h2 className="font-serif text-2xl">Gaps showing up often</h2>
                {data.skillGaps.length === 0 ? (
                  <p className="mt-3 text-sm text-ink/70">
                    No structured gaps yet. Upload a CV and this fills in.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {data.skillGaps.map((gap) => (
                      <span
                        key={gap.skill}
                        className="rounded-full border border-line bg-white px-3 py-1.5 text-ink"
                        style={{
                          fontSize: `${0.85 + (gap.jobCount / maxGap) * 0.55}rem`,
                        }}
                      >
                        {gap.skill}
                        <span className="ml-2 opacity-80">{gap.jobCount}</span>
                      </span>
                    ))}
                  </div>
                )}
                <Link href="/gaps" className="mt-5 inline-block text-sm font-medium underline">
                  See recommendations
                </Link>
              </section>

              <section className="rounded-2xl border border-line bg-white p-5">
                <h2 className="font-serif text-2xl">Fresh in the catalogue</h2>
                <ul className="mt-4 space-y-3">
                  {data.recentJobs.map((job) => {
                    return (
                      <li key={job.id} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-pine" />
                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                          <span className="block font-medium">{job.title}</span>
                          <span className="text-sm text-ink/65">{job.company}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
