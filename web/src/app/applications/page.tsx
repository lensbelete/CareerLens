"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/field";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Application, ApplicationStatus } from "@/types/api";

const STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export default function ApplicationsPage() {
  const [rows, setRows] = useState<Application[] | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load(nextStatus = status) {
    const path = nextStatus ? `/applications?status=${nextStatus}` : "/applications";
    setRows(await apiFetch<Application[]>(path));
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof ApiError ? err.message : "Could not load applications"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function update(id: string, patch: Partial<Application>) {
    setError("");
    try {
      await apiFetch(`/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await load();
      setNotice("Application updated.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this application from your tracker?")) return;
    try {
      await apiFetch(`/applications/${id}`, { method: "DELETE" });
      await load();
      setNotice("Application removed.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Remove failed");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Application tracker"
        description="Statuses, notes, and dates are persisted. Filter by pipeline stage."
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {!rows ? (
        <p className="text-sm text-stone-500">Loading applications…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No applications in this view"
          description="Open a job and save it to the tracker. Sample jobs are labelled and are not live vacancies."
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/jobs/${row.jobId}`} className="font-semibold hover:underline">
                    {row.job.title}
                  </Link>
                  <p className="text-sm text-stone-600">
                    {row.job.company} · updated {formatDate(row.updatedAt)}
                  </p>
                </div>
                <Badge tone={row.status === "rejected" ? "rose" : "teal"}>{row.status}</Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[160px_1fr_auto]">
                <Select
                  value={row.status}
                  onChange={(e) =>
                    update(row.id, { status: e.target.value as ApplicationStatus })
                  }
                >
                  {STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Textarea
                  defaultValue={row.notes}
                  onBlur={(e) => {
                    if (e.target.value !== row.notes) {
                      void update(row.id, { notes: e.target.value });
                    }
                  }}
                />
                <Button variant="danger" onClick={() => remove(row.id)}>
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
