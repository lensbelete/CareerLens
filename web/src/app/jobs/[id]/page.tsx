"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, Badge, Card, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { apiFetch, ApiError } from "@/lib/api";
import { employmentLabel, scoreTone } from "@/lib/format";
import type { Job, MatchResult } from "@/types/api";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("applied");
  const [pending, setPending] = useState(false);

  async function load() {
    const [jobResult, matchResult] = await Promise.all([
      apiFetch<Job>(`/jobs/${id}`),
      apiFetch<MatchResult>(`/jobs/${id}/match`),
    ]);
    setJob(jobResult);
    setMatch(matchResult);
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof ApiError ? err.message : "Could not load job"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleSave() {
    if (!job) return;
    setPending(true);
    try {
      if (job.saved) {
        await apiFetch(`/jobs/${job.id}/save`, { method: "DELETE" });
        setJob({ ...job, saved: false });
        setNotice("Removed from saved jobs.");
      } else {
        await apiFetch(`/jobs/${job.id}/save`, { method: "POST" });
        setJob({ ...job, saved: true });
        setNotice("Job saved.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update saved job");
    } finally {
      setPending(false);
    }
  }

  async function apply() {
    if (!job) return;
    setPending(true);
    try {
      await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify({ jobId: job.id, status, notes }),
      });
      setNotice("Application saved to your tracker.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save application");
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell>
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {!job ? (
        <p className="text-sm text-muted">Loading job…</p>
      ) : (
        <>
          <PageHeader
            title={job.title}
            description={`${job.company} · ${job.location} · ${employmentLabel(job.employmentType)}`}
            actions={
              <Button variant="secondary" onClick={toggleSave} disabled={pending}>
                {job.saved ? "Unsave" : "Save job"}
              </Button>
            }
          />
          <div className="mb-4 flex flex-wrap gap-2">
            {job.source === "sample" ? <Badge tone="sample">Sample listing — not a live vacancy</Badge> : null}
            {job.requiredSkills.map((skill) => (
              <Badge key={skill} tone="teal">
                {skill}
              </Badge>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <Card>
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  Description
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/80">
                  {job.description}
                </p>
              </Card>
              {match ? (
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                        Match analysis
                      </h2>
                      <p className="mt-1 text-xs text-muted">Method: {match.method}</p>
                    </div>
                    <span className={`rounded-sm px-3 py-1 font-serif text-4xl tabular-nums ${scoreTone(match.score)}`}>
                      {match.score}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink/80">{match.explanation}</p>
                  <p className="mt-2 text-xs text-muted">{match.disclaimer}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                    {Object.entries(match.breakdown).map(([key, value]) => (
                      <div key={key} className="rounded-sm border border-line bg-white p-2">
                        <dt className="text-xs capitalize text-muted">{key.replace(/([A-Z])/g, " $1")}</dt>
                        <dd className="font-medium tabular-nums">{Math.round(value * 100)}%</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              ) : null}
            </div>
            <div className="space-y-4">
              {match ? (
                <>
                  <Card>
                    <h3 className="text-sm font-semibold">Matched skills</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {match.matchedSkills.length === 0 ? (
                        <li className="text-muted">None evidenced.</li>
                      ) : (
                        match.matchedSkills.map((item) => (
                          <li key={`${item.skill}-${item.evidence}`}>
                            <span className="capitalize">{item.skill}</span>{" "}
                            <Badge tone={item.evidence === "explicit" ? "teal" : "amber"}>
                              {item.evidence}
                            </Badge>
                            <p className="text-xs text-muted">{item.source}</p>
                          </li>
                        ))
                      )}
                    </ul>
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold">Missing required</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {match.missingRequired.length === 0 ? (
                        <li className="text-muted">No required skills missing.</li>
                      ) : (
                        match.missingRequired.map((item) => (
                          <li key={item.skill} className="capitalize">
                            {item.skill}
                          </li>
                        ))
                      )}
                    </ul>
                    <Link href={`/gaps?jobId=${job.id}`} className="mt-3 inline-block text-sm font-medium text-pine">
                      Recommendations
                    </Link>
                  </Card>
                </>
              ) : null}
              <Card>
                <h3 className="text-sm font-semibold">Track an application</h3>
                <div className="mt-3 space-y-3">
                  <Field label="Status">
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="saved">Saved</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="offer">Offer</option>
                      <option value="rejected">Rejected</option>
                    </Select>
                  </Field>
                  <Field label="Notes">
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </Field>
                  <Button onClick={apply} disabled={pending}>
                    Save to tracker
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
