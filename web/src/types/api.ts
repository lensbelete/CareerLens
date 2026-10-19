export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type EducationEntry = {
  school: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
};

export type ExperienceEntry = {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  description?: string;
};

export type ProjectEntry = {
  name: string;
  description?: string;
  technologies?: string[];
};

export type Profile = {
  id: string;
  userId: string;
  headline: string | null;
  summary: string | null;
  location: string | null;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  updatedAt: string;
};

export type Resume = {
  id: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  extractedText: string | null;
  parsedData: {
    skills: string[];
    education: EducationEntry[];
    experience: ExperienceEntry[];
    projects: ProjectEntry[];
  } | null;
  isActive: boolean;
  createdAt: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  source: "sample" | "manual";
  sourceUrl: string | null;
  createdAt: string;
  saved?: boolean;
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type SkillMatch = {
  skill: string;
  evidence: "explicit" | "inferred" | "missing";
  source: string;
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
  breakdown: {
    requiredSkills: number;
    preferredSkills: number;
    textSimilarity: number;
    experience: number;
    education: number;
  };
  disclaimer: string;
};

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export type Application = {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  notes: string;
  appliedAt: string | null;
  interviewAt: string | null;
  updatedAt: string;
  job: Job;
};

export type DashboardSummary = {
  totals: {
    relevantMatches: number;
    savedJobs: number;
    activeApplications: number;
    interviews: number;
    offers: number;
  };
  applicationCounts: Record<ApplicationStatus, number>;
  recentJobs: Job[];
  recommended: Array<{
    job: Job;
    score: number;
    method: string;
    missingRequired: SkillMatch[];
  }>;
  skillGaps: Array<{ skill: string; jobCount: number }>;
  profileReady: boolean;
};

export type SkillGapsResponse = {
  job: Job | null;
  match: MatchResult | null;
  aggregated: Array<{
    skill: string;
    kind: "required" | "preferred";
    jobTitles: string[];
  }> | null;
  perJob?: Array<{
    job: { id: string; title: string; company: string };
    score: number;
    missingRequired: SkillMatch[];
    missingPreferred: SkillMatch[];
    recommendations: MatchResult["recommendations"];
  }>;
};
