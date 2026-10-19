import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ParsedResume } from "../common/types/profile-content";
import { User } from "../users/user.entity";

@Entity("resumes")
export class Resume {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column()
  userId!: string;

  @ManyToOne(() => User, (user) => user.resumes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  originalFilename!: string;

  @Column()
  storageKey!: string;

  @Column()
  mimeType!: string;

  @Column("int")
  sizeBytes!: number;

  @Column({ type: "text", nullable: true })
  extractedText!: string | null;

  @Column({ type: "jsonb", nullable: true })
  parsedData!: ParsedResume | null;

  @Column({ default: false })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
