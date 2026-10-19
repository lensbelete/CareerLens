import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationsModule } from "../applications/applications.module";
import { Job } from "../jobs/job.entity";
import { SavedJob } from "../jobs/saved-job.entity";
import { MatchingModule } from "../matching/matching.module";
import { Profile } from "../profiles/profile.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, SavedJob, Profile]),
    ApplicationsModule,
    MatchingModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
