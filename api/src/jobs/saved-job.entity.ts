import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "../users/user.entity";
import { Job } from "./job.entity";

@Entity("saved_jobs")
@Unique(["userId", "jobId"])
export class SavedJob {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @Index()
  @Column()
  jobId!: string;

  @ManyToOne(() => User, (user) => user.savedJobs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Job, (job) => job.savedBy, { onDelete: "CASCADE" })
  @JoinColumn({ name: "jobId" })
  job!: Job;

  @CreateDateColumn()
  createdAt!: Date;
}
