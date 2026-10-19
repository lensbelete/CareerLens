import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
} from "../common/types/profile-content";
import { User } from "../users/user.entity";

@Entity("profiles")
export class Profile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "varchar", nullable: true })
  headline!: string | null;

  @Column({ type: "text", nullable: true })
  summary!: string | null;

  @Column({ type: "varchar", nullable: true })
  location!: string | null;

  @Column({ type: "jsonb", default: [] })
  skills!: string[];

  @Column({ type: "jsonb", default: [] })
  education!: EducationEntry[];

  @Column({ type: "jsonb", default: [] })
  experience!: ExperienceEntry[];

  @Column({ type: "jsonb", default: [] })
  projects!: ProjectEntry[];

  @UpdateDateColumn()
  updatedAt!: Date;
}
