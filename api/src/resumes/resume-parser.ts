import {
  EducationEntry,
  ExperienceEntry,
  ParsedResume,
  ProjectEntry,
} from "../common/types/profile-content";

const SECTION_ALIASES: Record<string, SectionKey> = {
  skills: "skills",
  "technical skills": "skills",
  "core skills": "skills",
  "key skills": "skills",
  education: "education",
  "academic background": "education",
  experience: "experience",
  "work experience": "experience",
  "work history": "experience",
  employment: "experience",
  "professional experience": "experience",
  projects: "projects",
  "selected projects": "projects",
  "personal projects": "projects",
};

type SectionKey = "skills" | "education" | "experience" | "projects";

export function parseResumeText(text: string): ParsedResume {
  const sections = splitSections(text);
  return {
    skills: parseSkills(sections.skills ?? ""),
    education: parseEducation(sections.education ?? ""),
    experience: parseExperience(sections.experience ?? ""),
    projects: parseProjects(sections.projects ?? ""),
  };
}

function splitSections(text: string): Partial<Record<SectionKey, string>> {
  const lines = text.split(/\r?\n/);
  const collected: Partial<Record<SectionKey, string[]>> = {};
  let current: SectionKey | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const heading = normalizeHeading(line);
    if (heading && SECTION_ALIASES[heading]) {
      current = SECTION_ALIASES[heading];
      collected[current] ??= [];
      continue;
    }
    if (current) {
      collected[current]?.push(raw);
    }
  }

  return Object.fromEntries(
    Object.entries(collected).map(([key, value]) => [
      key,
      (value ?? []).join("\n").trim(),
    ]),
  ) as Partial<Record<SectionKey, string>>;
}

function normalizeHeading(line: string): string | null {
  const cleaned = line.replace(/[:\-|•*]/g, "").trim().toLowerCase();
  if (!cleaned || cleaned.length > 40) return null;
  if (SECTION_ALIASES[cleaned]) return cleaned;
  return null;
}

function parseSkills(block: string): string[] {
  if (!block) return [];
  const tokens = block
    .split(/[\n,|/•·;]+/)
    .map((part) => part.replace(/^[-*]\s*/, "").trim())
    .filter((part) => part.length > 1 && part.length < 48);
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const token of tokens) {
    const key = token.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    skills.push(token);
  }
  return skills;
}

function parseEducation(block: string): EducationEntry[] {
  if (!block) return [];
  return chunkEntries(block).flatMap((chunk) => {
    const lines = nonempty(chunk);
    if (lines.length === 0) return [];
    const school = lines[0];
    const rest = lines.slice(1).join(" ");
    const dates = extractDates(chunk);
    return [
      {
        school,
        degree: pickDegree(rest),
        field: pickField(rest),
        startDate: dates[0],
        endDate: dates[1],
      },
    ];
  });
}

function parseExperience(block: string): ExperienceEntry[] {
  if (!block) return [];
  return chunkEntries(block).flatMap((chunk) => {
    const lines = nonempty(chunk);
    if (lines.length === 0) return [];
    const header = lines[0];
    const { title, company } = splitTitleCompany(header, lines[1]);
    const dates = extractDates(chunk);
    const description = lines
      .slice(company && header.includes(company) ? 1 : 2)
      .join(" ")
      .trim();
    return [
      {
        title,
        company: company || "Unknown company",
        startDate: dates[0],
        endDate: dates[1],
        description: description || undefined,
      },
    ];
  });
}

function parseProjects(block: string): ProjectEntry[] {
  if (!block) return [];
  return chunkEntries(block).flatMap((chunk) => {
    const lines = nonempty(chunk);
    if (lines.length === 0) return [];
    return [
      {
        name: lines[0],
        description: lines.slice(1).join(" ").trim() || undefined,
      },
    ];
  });
}

function chunkEntries(block: string): string[] {
  const lines = block.split(/\r?\n/);
  const chunks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current.length) {
        chunks.push(current.join("\n"));
        current = [];
      }
      continue;
    }
    const looksLikeHeader =
      current.length > 0 &&
      !trimmed.startsWith("-") &&
      !trimmed.startsWith("•") &&
      !trimmed.startsWith("*") &&
      trimmed.length < 90 &&
      /[A-Za-z]/.test(trimmed);
    if (looksLikeHeader && current.length >= 2) {
      chunks.push(current.join("\n"));
      current = [trimmed];
      continue;
    }
    current.push(trimmed);
  }
  if (current.length) chunks.push(current.join("\n"));
  return chunks;
}

function nonempty(chunk: string): string[] {
  return chunk
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function extractDates(text: string): [string | undefined, string | undefined] {
  const matches = [
    ...text.matchAll(
      /\b((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{4})\b/gi,
    ),
  ].map((match) => match[1]);
  if (matches.length === 0) return [undefined, undefined];
  if (/\bpresent\b/i.test(text)) {
    return [matches[0], "Present"];
  }
  return [matches[0], matches[1]];
}

function pickDegree(text: string): string | undefined {
  const match = text.match(
    /\b(B\.?Sc\.?|M\.?Sc\.?|B\.?A\.?|M\.?A\.?|MBA|Ph\.?D\.?|Bachelor[^,]{0,40}|Master[^,]{0,40}|Diploma[^,]{0,40})\b/i,
  );
  return match?.[0];
}

function pickField(text: string): string | undefined {
  const match = text.match(
    /\bin\s+([A-Za-z][A-Za-z\s&/]{2,60}?)(?:\s+\d{4}|,|$)/,
  );
  return match?.[1]?.trim();
}

function splitTitleCompany(
  header: string,
  nextLine?: string,
): { title: string; company: string } {
  const at = header.split(/\s+at\s+|\s+[@|—–-]\s+/i);
  if (at.length >= 2) {
    return { title: at[0].trim(), company: at.slice(1).join(" ").trim() };
  }
  if (nextLine && nextLine.length < 80 && !nextLine.startsWith("-")) {
    return { title: header, company: nextLine };
  }
  return { title: header, company: "" };
}
