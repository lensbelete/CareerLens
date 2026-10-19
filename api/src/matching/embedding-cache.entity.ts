import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Entity("embedding_cache")
@Unique(["textHash", "provider", "model"])
export class EmbeddingCache {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  textHash!: string;

  @Column()
  provider!: string;

  @Column()
  model!: string;

  @Column({ type: "jsonb" })
  vector!: number[];

  @CreateDateColumn()
  createdAt!: Date;
}
