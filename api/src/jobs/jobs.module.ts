import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { SavedJob } from "./saved-job.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Job, SavedJob])],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
