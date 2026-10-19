import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Job } from "../jobs/job.entity";
import { User } from "../users/user.entity";

export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

@Entity("applications")
@Unique(["userId", "jobId"])
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column()
  jobId!: string;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Job, (job) => job.applications, { onDelete: "CASCADE" })
  @JoinColumn({ name: "jobId" })
  job!: Job;

  @Index()
  @Column({ default: "saved" })
  status!: ApplicationStatus;

  @Column({ type: "text", default: "" })
  notes!: string;

  @Column({ type: "timestamptz", nullable: true })
  appliedAt!: Date | null;

  @Column({ type: "timestamptz", nullable: true })
  interviewAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
