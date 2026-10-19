import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1730000000000 implements MigrationInterface {
  name = "InitialSchema1730000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL UNIQUE,
        "passwordHash" varchar NOT NULL,
        "fullName" varchar NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "headline" varchar,
        "summary" text,
        "location" varchar,
        "skills" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "education" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "experience" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "projects" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "resumes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "originalFilename" varchar NOT NULL,
        "storageKey" varchar NOT NULL,
        "mimeType" varchar NOT NULL,
        "sizeBytes" integer NOT NULL,
        "extractedText" text,
        "parsedData" jsonb,
        "isActive" boolean NOT NULL DEFAULT false,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_resumes_userId" ON "resumes" ("userId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" varchar NOT NULL,
        "company" varchar NOT NULL,
        "location" varchar NOT NULL,
        "employmentType" varchar NOT NULL,
        "description" text NOT NULL,
        "requiredSkills" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "preferredSkills" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "source" varchar NOT NULL DEFAULT 'manual',
        "sourceUrl" varchar,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_title" ON "jobs" ("title")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_jobs_location" ON "jobs" ("location")`,
    );

    await queryRunner.query(`
      CREATE TABLE "saved_jobs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "jobId" uuid NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_saved_jobs_user_job" UNIQUE ("userId", "jobId")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_saved_jobs_userId" ON "saved_jobs" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_saved_jobs_jobId" ON "saved_jobs" ("jobId")`,
    );

    await queryRunner.query(`
      CREATE TABLE "applications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "jobId" uuid NOT NULL REFERENCES "jobs"("id") ON DELETE CASCADE,
        "status" varchar NOT NULL DEFAULT 'saved',
        "notes" text NOT NULL DEFAULT '',
        "appliedAt" timestamptz,
        "interviewAt" timestamptz,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_applications_user_job" UNIQUE ("userId", "jobId")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_applications_userId" ON "applications" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_applications_jobId" ON "applications" ("jobId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_applications_status" ON "applications" ("status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "embedding_cache" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "textHash" varchar NOT NULL,
        "provider" varchar NOT NULL,
        "model" varchar NOT NULL,
        "vector" jsonb NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_embedding_cache_hash_provider_model" UNIQUE ("textHash", "provider", "model")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "embedding_cache"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "applications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_jobs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "jobs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resumes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profiles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
