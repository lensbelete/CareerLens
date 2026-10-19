import {
  EducationEntry,
  ExperienceEntry,
  ParsedResume,
  ProjectEntry,
} from "../common/types/profile-content";
import { Profile } from "../profiles/profile.entity";
import {
  COMMON_SKILLS,
  normalizeSkill,
  skillInText,
  tokenize,
  uniqueNormalized,
} from "./skills";

export type SkillEvidence = "explicit" | "inferred" | "missing";

export type SkillMatch = {
  skill: string;
  evidence: SkillEvidence;
  source: string;
};

export type MatchBreakdown = {
  requiredSkills: number;
  preferredSkills: number;
  textSimilarity: number;
  experience: number;
  education: number;
};

export type MatchResult = {
  score: number;
  method: "hybrid-embeddings" | "hybrid-lexical";
  matchedSkills: SkillMatch[];
  missingRequired: SkillMatch[];
  missingPreferred: SkillMatch[];
  strengths: string[];
  recommendations: Array<{
    skill: string;
    kind: "required" | "preferred";
    suggestion: string;
    generatedBy: "deterministic";
  }>;
  explanation: string;
  breakdown: MatchBreakdown;
  disclaimer: string;
};

export type CandidateSnapshot = {
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  summary: string;
  headline: string;
  resumeText: string;
};

export type JobSnapshot = {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
};

const WEIGHTS = {
  requiredSkills: 0.45,
  preferredSkills: 0.15,
  textSimilarity: 0.25,
  experience: 0.1,
  education: 0.05,
};

export const MATCH_DISCLAIMER =
  "This score measures overlap between the candidate profile and the job description. It is not an estimate of hiring probability.";

export function buildCandidateSnapshot(
  profile: Profile,
  resume: { extractedText: string | null; parsedData: ParsedResume | null } | null,
): CandidateSnapshot {
  const parsed = resume?.parsedData;
  const skills = uniqueNormalized([
    ...profile.skills,
    ...(parsed?.skills ?? []),
  ]);

  return {
    skills,
    education:
      profile.education.length > 0 ? profile.education : (parsed?.education ?? []),
    experience:
      profile.experience.length > 0
        ? profile.experience
        : (parsed?.experience ?? []),
    projects:
      profile.projects.length > 0 ? profile.projects : (parsed?.projects ?? []),
    summary: profile.summary ?? "",
    headline: profile.headline ?? "",
    resumeText: resume?.extractedText ?? "",
  };
}

export function candidateDocument(candidate: CandidateSnapshot): string {
  const experience = candidate.experience
    .map(
      (item) =>
        `${item.title} ${item.company} ${item.description ?? ""} ${item.startDate ?? ""} ${item.endDate ?? ""}`,
    )
    .join("\n");
  const projects = candidate.projects
    .map(
      (item) =>
        `${item.name} ${item.description ?? ""} ${(item.technologies ?? []).join(" ")}`,
    )
    .join("\n");
  const education = candidate.education
    .map((item) => `${item.school} ${item.degree ?? ""} ${item.field ?? ""}`)
    .join("\n");

  return [
    candidate.headline,
    candidate.summary,
    candidate.skills.join(" "),
    experience,
    projects,
    education,
    candidate.resumeText,
  ]
    .filter(Boolean)
    .join("\n");
}

export function scoreMatch(input: {
  candidate: CandidateSnapshot;
  job: JobSnapshot;
  textSimilarity: number;
  usedEmbeddings: boolean;
}): MatchResult {
  const document = candidateDocument(input.candidate);
  const explicitSkills = new Set(input.candidate.skills.map(normalizeSkill));
  const vocabulary = uniqueNormalized([
    ...COMMON_SKILLS,
    ...input.job.requiredSkills,
    ...input.job.preferredSkills,
    ...input.candidate.skills,
  ]);

  const inferredSkills = vocabulary.filter(
    (skill) => !explicitSkills.has(skill) && skillInText(skill, document),
  );
  const evidenced = new Set([...explicitSkills, ...inferredSkills]);

  const required = uniqueNormalized(input.job.requiredSkills);
  const preferred = uniqueNormalized(input.job.preferredSkills).filter(
    (skill) => !required.includes(skill),
  );

  const matchedSkills: SkillMatch[] = [];
  const missingRequired: SkillMatch[] = [];
  const missingPreferred: SkillMatch[] = [];

  for (const skill of required) {
    if (explicitSkills.has(skill)) {
      matchedSkills.push({
        skill,
        evidence: "explicit",
        source: "Listed on the candidate profile or CV skills section",
      });
    } else if (evidenced.has(skill)) {
      matchedSkills.push({
        skill,
        evidence: "inferred",
        source: "Mentioned in experience, projects, or CV text — not listed as a skill",
      });
    } else {
      missingRequired.push({
        skill,
        evidence: "missing",
        source: "Not evidenced in the candidate profile or CV",
      });
    }
  }

  for (const skill of preferred) {
    if (explicitSkills.has(skill)) {
      matchedSkills.push({
        skill,
        evidence: "explicit",
        source: "Listed on the candidate profile or CV skills section",
      });
    } else if (evidenced.has(skill)) {
      matchedSkills.push({
        skill,
        evidence: "inferred",
        source: "Mentioned in experience, projects, or CV text — not listed as a skill",
      });
    } else {
      missingPreferred.push({
        skill,
        evidence: "missing",
        source: "Preferred, and not evidenced in the candidate profile or CV",
      });
    }
  }

  const requiredScore =
    required.length === 0
      ? 0.6
      : matchedSkills.filter((item) => required.includes(item.skill)).length /
        required.length;
  const preferredMatched = preferred.length
    ? preferred.filter((skill) => evidenced.has(skill)).length / preferred.length
    : 0.5;
  const experienceScore = experienceFit(input.candidate, input.job);
  const educationScore = educationFit(input.candidate, input.job.description);
  const textSimilarity = clamp(input.textSimilarity, 0, 1);

  const breakdown: MatchBreakdown = {
    requiredSkills: round2(requiredScore),
    preferredSkills: round2(preferredMatched),
    textSimilarity: round2(textSimilarity),
    experience: round2(experienceScore),
    education: round2(educationScore),
  };

  const raw =
    breakdown.requiredSkills * WEIGHTS.requiredSkills +
    breakdown.preferredSkills * WEIGHTS.preferredSkills +
    breakdown.textSimilarity * WEIGHTS.textSimilarity +
    breakdown.experience * WEIGHTS.experience +
    breakdown.education * WEIGHTS.education;

  const score = Math.round(clamp(raw, 0, 1) * 100);
  const strengths = buildStrengths(input.candidate, matchedSkills, input.job);
  const recommendations = [
    ...missingRequired.map((item) => ({
      skill: item.skill,
      kind: "required" as const,
      suggestion: recommendationFor(item.skill, "required", input.job.title),
      generatedBy: "deterministic" as const,
    })),
    ...missingPreferred.map((item) => ({
      skill: item.skill,
      kind: "preferred" as const,
      suggestion: recommendationFor(item.skill, "preferred", input.job.title),
      generatedBy: "deterministic" as const,
    })),
  ];

  const method = input.usedEmbeddings ? "hybrid-embeddings" : "hybrid-lexical";
  const explanation = buildExplanation({
    score,
    method,
    required,
    matchedRequired: matchedSkills.filter((item) => required.includes(item.skill))
      .length,
    preferred,
    matchedPreferred: preferred.filter((skill) => evidenced.has(skill)).length,
    textSimilarity,
    usedEmbeddings: input.usedEmbeddings,
  });

  return {
    score,
    method,
    matchedSkills,
    missingRequired,
    missingPreferred,
    strengths,
    recommendations,
    explanation,
    breakdown,
    disclaimer: MATCH_DISCLAIMER,
  };
}

export function lexicalSimilarity(left: string, right: string): number {
  const leftTokens = tokenize(left);
  const rightTokens = tokenize(right);
  if (leftTokens.length === 0 || rightTokens.length === 0) return 0;

  const df = new Map<string, number>();
  for (const token of new Set(leftTokens)) df.set(token, (df.get(token) ?? 0) + 1);
  for (const token of new Set(rightTokens)) df.set(token, (df.get(token) ?? 0) + 1);

  const leftVec = tfidf(leftTokens, df, 2);
  const rightVec = tfidf(rightTokens, df, 2);
  return cosine(leftVec, rightVec);
}

export function cosine(left: number[], right: number[]): number {
  const size = Math.min(left.length, right.length);
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let i = 0; i < size; i += 1) {
    dot += left[i] * right[i];
    leftNorm += left[i] * left[i];
    rightNorm += right[i] * right[i];
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm));
}

function tfidf(
  tokens: string[],
  df: Map<string, number>,
  docs: number,
): number[] {
  const tf = new Map<string, number>();
  for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1);
  const vocab = [...df.keys()].sort();
  return vocab.map((token) => {
    const termFrequency = (tf.get(token) ?? 0) / tokens.length;
    const idf = Math.log((docs + 1) / ((df.get(token) ?? 0) + 1)) + 1;
    return termFrequency * idf;
  });
}

function experienceFit(candidate: CandidateSnapshot, job: JobSnapshot): number {
  if (candidate.experience.length === 0) return 0.2;
  const blob = candidate.experience
    .map((item) => `${item.title} ${item.company} ${item.description ?? ""}`)
    .join(" ");
  const titleTokens = tokenize(job.title).filter((token) => token.length > 3);
  if (titleTokens.length === 0) return 0.5;
  const hits = titleTokens.filter((token) =>
    skillInText(token, blob + " " + candidate.headline),
  ).length;
  return clamp(0.35 + hits / titleTokens.length, 0, 1);
}

function educationFit(candidate: CandidateSnapshot, description: string): number {
  const mentionsDegree = /\b(bachelor|master|phd|degree|b\.?sc|m\.?sc)\b/i.test(
    description,
  );
  if (!mentionsDegree) return 0.7;
  if (candidate.education.length === 0) return 0.25;
  const haystack = candidate.education
    .map((item) => `${item.degree ?? ""} ${item.field ?? ""} ${item.school}`)
    .join(" ");
  return /\b(bachelor|master|phd|b\.?sc|m\.?sc|ba|ma|degree)\b/i.test(haystack)
    ? 0.9
    : 0.45;
}

function buildStrengths(
  candidate: CandidateSnapshot,
  matched: SkillMatch[],
  job: JobSnapshot,
): string[] {
  const strengths: string[] = [];
  const explicit = matched.filter((item) => item.evidence === "explicit");
  if (explicit.length > 0) {
    strengths.push(
      `Explicitly lists ${explicit
        .slice(0, 4)
        .map((item) => item.skill)
        .join(", ")} which ${job.title} asks for.`,
    );
  }
  const inferred = matched.filter((item) => item.evidence === "inferred");
  if (inferred.length > 0) {
    strengths.push(
      `Experience text supports ${inferred
        .slice(0, 3)
        .map((item) => item.skill)
        .join(", ")} even though they are not listed as skills.`,
    );
  }
  if (candidate.experience.length > 0) {
    const latest = candidate.experience[0];
    strengths.push(
      `Recent role as ${latest.title} at ${latest.company} is the closest experience signal.`,
    );
  }
  return strengths.slice(0, 4);
}

function recommendationFor(
  skill: string,
  kind: "required" | "preferred",
  title: string,
): string {
  if (kind === "required") {
    return `Add evidence of ${skill} — a project, production use, or coursework — before applying to ${title}. The job lists it as required.`;
  }
  return `${skill} is preferred for ${title}. A small public example or a focused tutorial project would close this gap.`;
}

function buildExplanation(input: {
  score: number;
  method: string;
  required: string[];
  matchedRequired: number;
  preferred: string[];
  matchedPreferred: number;
  textSimilarity: number;
  usedEmbeddings: boolean;
}): string {
  const requiredPart =
    input.required.length === 0
      ? "The listing did not include a structured required-skill list, so that component was down-weighted."
      : `${input.matchedRequired} of ${input.required.length} required skills are evidenced.`;
  const preferredPart =
    input.preferred.length === 0
      ? "No preferred skills were listed."
      : `${input.matchedPreferred} of ${input.preferred.length} preferred skills are evidenced.`;
  const similarityPart = input.usedEmbeddings
    ? `Semantic similarity used cached embeddings (cosine ${pct(input.textSimilarity)}).`
    : `Text overlap used a deterministic TF-IDF cosine (${pct(input.textSimilarity)}), because no embedding service is configured.`;

  return `Score ${input.score}/100 from a weighted mix of required skills (45%), preferred skills (15%), text similarity (25%), experience (10%), and education (5%). ${requiredPart} ${preferredPart} ${similarityPart}`;
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
