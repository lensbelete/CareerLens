"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/format";
import type { Resume } from "@/types/api";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  async function load() {
    setResumes(await apiFetch<Resume[]>("/resumes"));
  }

  useEffect(() => {
    load().catch((err) =>
      setError(err instanceof ApiError ? err.message : "Could not load CVs"),
    );
  }, []);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("file") as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setError("Choose a PDF first");
      return;
    }
    setPending(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      await apiFetch("/resumes", { method: "POST", body });
      input.value = "";
      await load();
      setNotice("CV uploaded. Review the extracted fields on your profile.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setPending(false);
    }
  }

  async function activate(id: string) {
    await apiFetch(`/resumes/${id}/activate`, { method: "POST" });
    await load();
    setNotice("Active CV updated. Matching now uses this file plus your profile.");
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this CV from CareerLens?")) return;
    await apiFetch(`/resumes/${id}`, { method: "DELETE" });
    await load();
    setNotice("CV deleted.");
  }

  return (
    <AppShell>
      <PageHeader
        title="CV management"
        description="PDF only, 5MB limit. Extraction is heuristic — edit the profile if a section is wrong. We do not invent missing jobs or degrees."
      />
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <Card className="mb-6">
        <form onSubmit={upload} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm">
            <span className="mb-1.5 block font-medium">Upload PDF</span>
            <input
              name="file"
              type="file"
              accept="application/pdf"
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-2"
            />
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
        </form>
      </Card>
      {!resumes ? (
        <p className="text-sm text-stone-500">Loading CVs…</p>
      ) : resumes.length === 0 ? (
        <EmptyState
          title="No CVs uploaded"
          description="Add a PDF to extract skills and experience. Matching can also run from a manually edited profile."
        />
      ) : (
        <div className="grid gap-3">
          {resumes.map((resume) => (
            <Card key={resume.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{resume.originalFilename}</h2>
                  <p className="text-sm text-stone-600">
                    {formatBytes(resume.sizeBytes)} · {formatDate(resume.createdAt)}
                  </p>
                </div>
                {resume.isActive ? <Badge tone="teal">Active</Badge> : null}
              </div>
              {resume.parsedData ? (
                <p className="mt-3 text-sm text-stone-700">
                  Extracted {resume.parsedData.skills.length} skills,{" "}
                  {resume.parsedData.experience.length} experience entries,{" "}
                  {resume.parsedData.education.length} education entries.
                </p>
              ) : (
                <p className="mt-3 text-sm text-stone-600">
                  Text could not be extracted. You can still keep the file and fill the profile by hand.
                </p>
              )}
              <div className="mt-4 flex gap-2">
                {!resume.isActive ? (
                  <Button variant="secondary" onClick={() => activate(resume.id)}>
                    Make active
                  </Button>
                ) : null}
                <Button variant="danger" onClick={() => remove(resume.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
