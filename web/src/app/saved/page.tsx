"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { Alert, EmptyState, PageHeader } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";
import type { Job } from "@/types/api";

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Job[]>("/jobs/saved")
      .then(setJobs)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load saved jobs"),
      );
  }, []);

  return (
    <AppShell>
      <PageHeader
        title="Saved jobs"
        description="Bookmarks are stored on the server and belong only to your account."
      />
      {error ? <Alert>{error}</Alert> : null}
      {!jobs ? (
        <p className="text-sm text-stone-500">Loading saved jobs…</p>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Open a job and use Save job. Saved roles also appear on the dashboard."
        />
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
