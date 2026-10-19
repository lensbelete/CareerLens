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

export type ParsedResume = {
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
};
