import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Application } from "../applications/application.entity";
import { Profile } from "../profiles/profile.entity";
import { Resume } from "../resumes/resume.entity";
import { SavedJob } from "../jobs/saved-job.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  fullName!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToOne(() => Profile, (profile) => profile.user)
  profile?: Profile;

  @OneToMany(() => Resume, (resume) => resume.user)
  resumes?: Resume[];

  @OneToMany(() => SavedJob, (saved) => saved.user)
  savedJobs?: SavedJob[];

  @OneToMany(() => Application, (application) => application.user)
  applications?: Application[];
}
