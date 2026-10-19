import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user";
import { CreateJobDto } from "./dto/create-job.dto";
import { ListJobsQueryDto } from "./dto/list-jobs.query";
import { JobsService } from "./jobs.service";

@Controller("jobs")
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobs: JobsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListJobsQueryDto) {
    return this.jobs.list(user.id, query);
  }

  @Get("saved")
  saved(@CurrentUser() user: AuthUser) {
    return this.jobs.listSaved(user.id);
  }

  @Get(":id")
  get(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.jobs.get(user.id, id);
  }

  @Post()
  create(@Body() dto: CreateJobDto) {
    return this.jobs.createManual(dto);
  }

  @Post(":id/save")
  save(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.jobs.saveJob(user.id, id);
  }

  @Delete(":id/save")
  unsave(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.jobs.unsaveJob(user.id, id);
  }
}
