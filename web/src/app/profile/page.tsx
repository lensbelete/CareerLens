"use client";

import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, Card, PageHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { apiFetch, ApiError } from "@/lib/api";
import type { Profile } from "@/types/api";

const emptyProfile: Profile = {
  id: "",
  userId: "",
  headline: "",
  summary: "",
  location: "",
  skills: [],
  education: [],
  experience: [],
  projects: [],
  updatedAt: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    apiFetch<Profile>("/profile")
      .then(setProfile)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not load profile"),
      );
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const saved = await apiFetch<Profile>("/profile", {
        method: "PATCH",
        body: JSON.stringify({
          headline: profile.headline,
          summary: profile.summary,
          location: profile.location,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience,
          projects: profile.projects,
        }),
      });
      setProfile(saved);
      setNotice("Profile saved. Matching uses this data immediately.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Candidate profile"
        description="This is the source of truth for matching. Empty fields stay empty — we do not invent employers or degrees."
      />
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <form onSubmit={save} className="space-y-4">
        <Card className="grid gap-3 md:grid-cols-2">
          <Field label="Headline">
            <Input
              value={profile.headline ?? ""}
              onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            />
          </Field>
          <Field label="Location">
            <Input
              value={profile.location ?? ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Summary">
              <Textarea
                value={profile.summary ?? ""}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Skills" hint="Comma-separated. These count as explicit evidence.">
              <Input
                value={profile.skills.join(", ")}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    skills: e.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                  })
                }
              />
            </Field>
          </div>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Experience</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  experience: [
                    ...profile.experience,
                    { title: "", company: "", description: "" },
                  ],
                })
              }
            >
              Add role
            </Button>
          </div>
          {profile.experience.length === 0 ? (
            <p className="text-sm text-muted">No experience listed.</p>
          ) : (
            <div className="space-y-4">
              {profile.experience.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-sm border border-line p-3 md:grid-cols-2">
                  <Input
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => {
                      const experience = [...profile.experience];
                      experience[index] = { ...item, title: e.target.value };
                      setProfile({ ...profile, experience });
                    }}
                  />
                  <Input
                    placeholder="Company"
                    value={item.company}
                    onChange={(e) => {
                      const experience = [...profile.experience];
                      experience[index] = { ...item, company: e.target.value };
                      setProfile({ ...profile, experience });
                    }}
                  />
                  <Textarea
                    className="md:col-span-2"
                    placeholder="Description"
                    value={item.description ?? ""}
                    onChange={(e) => {
                      const experience = [...profile.experience];
                      experience[index] = { ...item, description: e.target.value };
                      setProfile({ ...profile, experience });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setProfile({
                        ...profile,
                        experience: profile.experience.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Education</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  education: [...profile.education, { school: "" }],
                })
              }
            >
              Add education
            </Button>
          </div>
          {profile.education.map((item, index) => (
            <div key={index} className="mb-3 grid gap-2 md:grid-cols-2">
              <Input
                placeholder="School"
                value={item.school}
                onChange={(e) => {
                  const education = [...profile.education];
                  education[index] = { ...item, school: e.target.value };
                  setProfile({ ...profile, education });
                }}
              />
              <Input
                placeholder="Degree / field"
                value={`${item.degree ?? ""} ${item.field ?? ""}`.trim()}
                onChange={(e) => {
                  const education = [...profile.education];
                  education[index] = { ...item, field: e.target.value };
                  setProfile({ ...profile, education });
                }}
              />
            </div>
          ))}
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Projects</h2>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setProfile({
                  ...profile,
                  projects: [...profile.projects, { name: "", description: "" }],
                })
              }
            >
              Add project
            </Button>
          </div>
          {profile.projects.length === 0 ? (
            <p className="text-sm text-muted">No projects listed.</p>
          ) : (
            profile.projects.map((item, index) => (
              <div key={index} className="mb-3 grid gap-2 md:grid-cols-2">
                <Input
                  placeholder="Name"
                  value={item.name}
                  onChange={(e) => {
                    const projects = [...profile.projects];
                    projects[index] = { ...item, name: e.target.value };
                    setProfile({ ...profile, projects });
                  }}
                />
                <Input
                  placeholder="Technologies (comma-separated)"
                  value={(item.technologies ?? []).join(", ")}
                  onChange={(e) => {
                    const projects = [...profile.projects];
                    projects[index] = {
                      ...item,
                      technologies: e.target.value
                        .split(",")
                        .map((part) => part.trim())
                        .filter(Boolean),
                    };
                    setProfile({ ...profile, projects });
                  }}
                />
                <Textarea
                  className="md:col-span-2"
                  placeholder="Description"
                  value={item.description ?? ""}
                  onChange={(e) => {
                    const projects = [...profile.projects];
                    projects[index] = { ...item, description: e.target.value };
                    setProfile({ ...profile, projects });
                  }}
                />
              </div>
            ))
          )}
        </Card>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </AppShell>
  );
}
