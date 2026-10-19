"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { JobCard } from "@/components/jobs/job-card";
import { Alert, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { apiFetch, ApiError } from "@/lib/api";
import type { Job, Paginated } from "@/types/api";

const EMPTY_FORM = {
  title: "",
  company: "",
  location: "",
  employmentType: "full-time",
  description: "",
  requiredSkills: "",
  preferredSkills: "",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Paginated<Job> | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "8",
      sortBy,
      sortOrder: sortBy === "createdAt" ? "DESC" : "ASC",
    });
    if (title) params.set("title", title);
    if (location) params.set("location", location);
    if (skills) params.set("skills", skills);
    if (employmentType) params.set("employmentType", employmentType);

    apiFetch<Paginated<Job>>(`/jobs?${params.toString()}`)
      .then(setJobs)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load jobs"),
      );
  }, [title, location, skills, employmentType, sortBy, page]);

  async function createJob(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await apiFetch("/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          requiredSkills: form.requiredSkills.split(",").map((item) => item.trim()).filter(Boolean),
          preferredSkills: form.preferredSkills.split(",").map((item) => item.trim()).filter(Boolean),
        }),
      });
      setForm(EMPTY_FORM);
      setShowCreate(false);
      setPage(1);
      const refreshed = await apiFetch<Paginated<Job>>("/jobs?page=1&pageSize=8");
      setJobs(refreshed);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create job");
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Job discovery"
        description="Sample listings are labelled. Filter by title, location, skills, and employment type."
        actions={
          <Button variant="secondary" onClick={() => setShowCreate((value) => !value)}>
            {showCreate ? "Cancel" : "Add job"}
          </Button>
        }
      />
      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}
      {showCreate ? (
        <Card className="mb-6">
          <h2 className="text-base font-semibold">Add a job manually</h2>
          <form onSubmit={createJob} className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Title">
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Company">
              <Input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </Field>
            <Field label="Location">
              <Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
            <Field label="Employment type">
              <Select
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </Select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Description" hint="At least 20 characters. State that it is not a live vacancy if it is sample-like.">
                <Textarea
                  required
                  minLength={20}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Required skills" hint="Comma-separated">
              <Input
                required
                value={form.requiredSkills}
                onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })}
              />
            </Field>
            <Field label="Preferred skills">
              <Input
                value={form.preferredSkills}
                onChange={(e) => setForm({ ...form, preferredSkills: e.target.value })}
              />
            </Field>
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save job"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <Input placeholder="Title" value={title} onChange={(e) => { setTitle(e.target.value); setPage(1); }} />
        <Input placeholder="Location" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }} />
        <Input placeholder="Skills (comma-separated)" value={skills} onChange={(e) => { setSkills(e.target.value); setPage(1); }} />
        <Select value={employmentType} onChange={(e) => { setEmploymentType(e.target.value); setPage(1); }}>
          <option value="">Any type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
          <option value="remote">Remote</option>
        </Select>
      </div>
      <div className="mb-4 flex items-center justify-between">
        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="title">Title</option>
          <option value="company">Company</option>
        </Select>
        {jobs ? (
          <p className="text-sm text-muted">
            {jobs.meta.total} jobs · page {jobs.meta.page} of {jobs.meta.totalPages}
          </p>
        ) : null}
      </div>
      {!jobs ? (
        <p className="text-sm text-muted">Loading jobs…</p>
      ) : jobs.data.length === 0 ? (
        <EmptyState
          title="No jobs match those filters"
          description="Clear the filters or add a job manually. If the catalogue is empty, run the API seed script."
        />
      ) : (
        <div className="grid gap-3">
          {jobs.data.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
      {jobs && jobs.meta.totalPages > 1 ? (
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="secondary"
            disabled={page >= jobs.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </AppShell>
  );
}
