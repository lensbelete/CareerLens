import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "../jobs/job.entity";
import { MatchingModule } from "../matching/matching.module";
import { SkillsController } from "./skills.controller";

@Module({
  imports: [MatchingModule, TypeOrmModule.forFeature([Job])],
  controllers: [SkillsController],
})
export class SkillsModule {}
