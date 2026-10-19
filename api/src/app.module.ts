import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_GUARD } from "@nestjs/core";
import { ApplicationsModule } from "./applications/applications.module";
import { Application } from "./applications/application.entity";
import { AuthModule } from "./auth/auth.module";
import { configuration, AppConfig } from "./config/configuration";
import { envValidationSchema } from "./config/env.validation";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";
import { JobsModule } from "./jobs/jobs.module";
import { Job } from "./jobs/job.entity";
import { SavedJob } from "./jobs/saved-job.entity";
import { MatchingModule } from "./matching/matching.module";
import { EmbeddingCache } from "./matching/embedding-cache.entity";
import { ProfilesModule } from "./profiles/profiles.module";
import { Profile } from "./profiles/profile.entity";
import { ResumesModule } from "./resumes/resumes.module";
import { Resume } from "./resumes/resume.entity";
import { SkillsModule } from "./skills/skills.module";
import { UsersModule } from "./users/users.module";
import { User } from "./users/user.entity";
import { InitialSchema1730000000000 } from "./database/migrations/1730000000000-InitialSchema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 120 }],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const database = config.get("database", { infer: true });
        return {
          type: "postgres" as const,
          host: database.host,
          port: database.port,
          username: database.user,
          password: database.password,
          database: database.name,
          entities: [
            User,
            Profile,
            Resume,
            Job,
            SavedJob,
            Application,
            EmbeddingCache,
          ],
          migrations: [InitialSchema1730000000000],
          synchronize: database.synchronize,
          migrationsRun: database.migrationsRun,
          logging: config.get("nodeEnv", { infer: true }) === "development",
        };
      },
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    ResumesModule,
    JobsModule,
    MatchingModule,
    ApplicationsModule,
    DashboardModule,
    SkillsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
