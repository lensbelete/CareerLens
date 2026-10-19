import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Application } from "../applications/application.entity";
import { SavedJob } from "./saved-job.entity";

export const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "remote",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const JOB_SOURCES = ["sample", "manual"] as const;
export type JobSource = (typeof JOB_SOURCES)[number];

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column()
  title!: string;

  @Column()
  company!: string;

  @Index()
  @Column()
  location!: string;

  @Column()
  employmentType!: EmploymentType;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "jsonb", default: [] })
  requiredSkills!: string[];

  @Column({ type: "jsonb", default: [] })
  preferredSkills!: string[];

  @Column({ default: "manual" })
  source!: JobSource;

  @Column({ type: "varchar", nullable: true })
  sourceUrl!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany(() => SavedJob, (saved) => saved.job)
  savedBy?: SavedJob[];

  @OneToMany(() => Application, (application) => application.job)
  applications?: Application[];
}
