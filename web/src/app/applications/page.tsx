"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/field";
import { apiFetch, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useConfirm } from "@/components/ui/confirm-modal";
import type { Application, ApplicationStatus } from "@/types/api";

const STATUSES: ApplicationStatus[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export default function ApplicationsPage() {
  const confirm = useConfirm();
  const [rows, setRows] = useState<Application[] | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

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
    try {
      await apiFetch(`/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await load();
      notifySuccess("Application updated.");
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function remove(id: string) {
    const ok = await confirm({
      title: "Remove application",
      message: "Remove this application from your tracker?",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    try {
      await apiFetch(`/applications/${id}`, { method: "DELETE" });
      await load();
      notifySuccess("Application removed.");
    } catch (err) {
      notifyError(err instanceof ApiError ? err.message : "Remove failed");
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
      {!rows ? (
        <p className="text-sm text-muted">Loading applications…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No applications in this view"
          description="Open a job and save it to the tracker. Sample jobs are labelled and are not live vacancies."
        />
      ) : (
        <div className="grid gap-3">
          {rows.map((row) => (
            <Card key={row.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/jobs/${row.jobId}`} className="font-semibold hover:underline">
                    {row.job.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {row.job.company} · updated {formatDate(row.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-36">
                    <Select
                      className="h-9 py-0"
                      value={row.status}
                      onChange={(e) =>
                        update(row.id, { status: e.target.value as ApplicationStatus })
                      }
                      aria-label="Application status"
                    >
                      {STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button
                    className="h-9"
                    variant="danger"
                    onClick={() => remove(row.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <Field label="Notes">
                  <Textarea
                    className="min-h-24"
                    placeholder="Add a note…"
                    defaultValue={row.notes}
                    onBlur={(e) => {
                      if (e.target.value !== row.notes) {
                        void update(row.id, { notes: e.target.value });
                      }
                    }}
                  />
                </Field>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
