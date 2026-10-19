import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "../jobs/job.entity";
import { Profile } from "../profiles/profile.entity";
import { Resume } from "../resumes/resume.entity";
import { EmbeddingCache } from "./embedding-cache.entity";
import { EmbeddingsService } from "./embeddings.service";
import { MatchingController } from "./matching.controller";
import { MatchingService } from "./matching.service";

@Module({
  imports: [TypeOrmModule.forFeature([Job, Profile, Resume, EmbeddingCache])],
  controllers: [MatchingController],
  providers: [MatchingService, EmbeddingsService],
  exports: [MatchingService],
})
export class MatchingModule {}
