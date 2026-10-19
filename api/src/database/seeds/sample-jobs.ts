import { DeepPartial } from "typeorm";
import { Job } from "../../jobs/job.entity";

export const SAMPLE_JOBS: DeepPartial<Job>[] = [
  {
    title: "Senior Frontend Engineer",
    company: "Northwind Analytics",
    location: "Remote — EU",
    employmentType: "remote",
    source: "sample",
    requiredSkills: ["TypeScript", "React", "Next.js", "CSS", "Jest"],
    preferredSkills: ["GraphQL", "Playwright", "Tailwind CSS"],
    description: `SAMPLE LISTING — not a live vacancy.

Northwind Analytics is hiring a senior frontend engineer to own the customer-facing reporting UI. You will work with product designers on accessible data-dense views, keep the Next.js app typed, and review frontend performance.

Required: TypeScript, React, Next.js, CSS, and automated tests with Jest.
Nice to have: GraphQL, Playwright, Tailwind CSS, and experience shipping design systems.
Education: a bachelor's degree is useful but equivalent experience is accepted.`,
  },
  {
    title: "Backend Engineer",
    company: "Harbor Pay",
    location: "London, UK",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["Node.js", "TypeScript", "PostgreSQL", "REST APIs", "Docker"],
    preferredSkills: ["NestJS", "Redis", "Kubernetes"],
    description: `SAMPLE LISTING — not a live vacancy.

Harbor Pay processes payouts for independent contractors. This backend role owns payment state machines, idempotent APIs, and operational runbooks.

Required: Node.js, TypeScript, PostgreSQL, REST APIs, Docker.
Preferred: NestJS, Redis, Kubernetes, and experience with financial audit logs.`,
  },
  {
    title: "Full-Stack Engineer",
    company: "Leaf & Ledger",
    location: "Berlin, Germany",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "Git"],
    preferredSkills: ["TypeScript", "AWS", "CI/CD"],
    description: `SAMPLE LISTING — not a live vacancy.

Leaf & Ledger builds bookkeeping tools for small practices. You will ship features across the React client and Node API, write SQL migrations, and sit in on customer support rotations.

Required: JavaScript, React, Node.js, SQL, Git.
Preferred: TypeScript, Amazon Web Services, GitHub Actions.`,
  },
  {
    title: "Python Data Engineer",
    company: "Cinder Research",
    location: "Manchester, UK",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["Python", "SQL", "PostgreSQL", "Pandas", "Docker"],
    preferredSkills: ["dbt", "Airflow", "AWS"],
    description: `SAMPLE LISTING — not a live vacancy.

Cinder Research maintains climate datasets for public agencies. The data engineer will model warehouse tables, keep ingestion jobs observable, and document data contracts.

Required: Python, SQL, PostgreSQL, Pandas, Docker.
Preferred: dbt, Airflow, Amazon Web Services.
A bachelor's degree in a quantitative field is listed; equivalent industry experience is accepted.`,
  },
  {
    title: "Machine Learning Engineer",
    company: "Helix Clinics",
    location: "Remote — UK",
    employmentType: "remote",
    source: "sample",
    requiredSkills: ["Python", "PyTorch", "Machine Learning", "SQL", "Linux"],
    preferredSkills: ["FastAPI", "Docker", "Kubernetes"],
    description: `SAMPLE LISTING — not a live vacancy.

Helix Clinics is evaluating models that triage incoming radiology reports. This is research-adjacent engineering: reproducible training, evaluation against held-out data, and a FastAPI inference path.

Required: Python, PyTorch, machine learning fundamentals, SQL, Linux.
Preferred: FastAPI, Docker, Kubernetes.
Do not expect production-scale MLOps on day one.`,
  },
  {
    title: "DevOps Engineer",
    company: "Stackyard",
    location: "Amsterdam, NL",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Terraform"],
    preferredSkills: ["AWS", "Prometheus", "Grafana"],
    description: `SAMPLE LISTING — not a live vacancy.

Stackyard runs a managed CI platform. You will own cluster upgrades, Terraform modules, and on-call for build runners.

Required: Linux, Docker, Kubernetes, CI/CD, Terraform.
Preferred: Amazon Web Services, Prometheus, Grafana.`,
  },
  {
    title: "Product Designer",
    company: "Kindling",
    location: "Remote — US",
    employmentType: "contract",
    source: "sample",
    requiredSkills: ["Figma", "User Research", "Prototyping", "Accessibility"],
    preferredSkills: ["HTML", "CSS", "Design Systems"],
    description: `SAMPLE LISTING — not a live vacancy.

Kindling is a 6-month contract for a product designer who can run interviews, ship Figma prototypes, and partner with engineers on accessibility.

Required: Figma, user research, prototyping, accessibility.
Preferred: HTML, CSS, design systems.`,
  },
  {
    title: "QA Engineer",
    company: "Parcelbird",
    location: "Leeds, UK",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["Playwright", "Jest", "CI/CD", "SQL"],
    preferredSkills: ["Cypress", "TypeScript", "Docker"],
    description: `SAMPLE LISTING — not a live vacancy.

Parcelbird needs a QA engineer to convert brittle release checklists into Playwright coverage and keep staging data honest.

Required: Playwright, Jest, CI/CD, SQL.
Preferred: Cypress, TypeScript, Docker.`,
  },
  {
    title: "Mobile Engineer (React Native)",
    company: "Tidepool Health",
    location: "Dublin, IE",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["React Native", "TypeScript", "REST APIs", "Jest"],
    preferredSkills: ["GraphQL", "CI/CD", "Figma"],
    description: `SAMPLE LISTING — not a live vacancy.

Tidepool Health is rebuilding its patient diary app in React Native. You will own offline-first sync and release automation.

Required: React Native, TypeScript, REST APIs, Jest.
Preferred: GraphQL, CI/CD, Figma.`,
  },
  {
    title: "Security Engineer",
    company: "Oakline Bank",
    location: "Edinburgh, UK",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["Linux", "Threat Modeling", "Python", "AWS"],
    preferredSkills: ["Terraform", "Kubernetes", "SIEM"],
    description: `SAMPLE LISTING — not a live vacancy.

Oakline Bank is hiring a security engineer to run application threat models, review IAM policies, and write detection content.

Required: Linux, threat modeling, Python, Amazon Web Services.
Preferred: Terraform, Kubernetes, SIEM tooling.
A related degree is listed; demonstrable security work is the actual bar.`,
  },
  {
    title: "Customer Success Engineer",
    company: "Nimbus Docs",
    location: "Remote — EMEA",
    employmentType: "remote",
    source: "sample",
    requiredSkills: ["SQL", "REST APIs", "Technical Writing", "JavaScript"],
    preferredSkills: ["Python", "GraphQL", "Salesforce"],
    description: `SAMPLE LISTING — not a live vacancy.

Nimbus Docs wants a customer success engineer who can reproduce API issues, write runbooks, and sit between support and product.

Required: SQL, REST APIs, technical writing, JavaScript.
Preferred: Python, GraphQL, Salesforce.`,
  },
  {
    title: "Engineering Manager",
    company: "Brightline Transit",
    location: "Birmingham, UK",
    employmentType: "full-time",
    source: "sample",
    requiredSkills: ["People Management", "TypeScript", "Agile", "System Design"],
    preferredSkills: ["PostgreSQL", "AWS", "Hiring"],
    description: `SAMPLE LISTING — not a live vacancy.

Brightline Transit is hiring an engineering manager for a team of six. You will still read TypeScript PRs, but the job is staffing, delivery, and incident communication.

Required: people management, TypeScript literacy, agile delivery, system design.
Preferred: PostgreSQL, Amazon Web Services, hiring experience.`,
  },
];
