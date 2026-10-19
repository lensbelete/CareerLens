import "reflect-metadata";
import { config as loadEnv } from "dotenv";
import { DataSource } from "typeorm";
import { Application } from "../applications/application.entity";
import { Job } from "../jobs/job.entity";
import { SavedJob } from "../jobs/saved-job.entity";
import { EmbeddingCache } from "../matching/embedding-cache.entity";
import { Profile } from "../profiles/profile.entity";
import { Resume } from "../resumes/resume.entity";
import { User } from "../users/user.entity";
import { InitialSchema1730000000000 } from "./migrations/1730000000000-InitialSchema";

loadEnv();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 5432),
  username: process.env.DATABASE_USER ?? "careerlens",
  password: process.env.DATABASE_PASSWORD ?? "careerlens",
  database: process.env.DATABASE_NAME ?? "careerlens",
  entities: [User, Profile, Resume, Job, SavedJob, Application, EmbeddingCache],
  migrations: [InitialSchema1730000000000],
});
