import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { IsIn, IsOptional } from "class-validator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user";
import { APPLICATION_STATUSES, ApplicationStatus } from "./application.entity";
import { ApplicationsService } from "./applications.service";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { UpsertApplicationDto } from "./dto/upsert-application.dto";

class ListApplicationsQuery {
  @IsOptional()
  @IsIn(APPLICATION_STATUSES)
  status?: ApplicationStatus;
}

@Controller("applications")
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applications: ApplicationsService) {}

  @Get()
  list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListApplicationsQuery,
  ) {
    return this.applications.list(user.id, query.status);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: UpsertApplicationDto) {
    return this.applications.upsert(user.id, dto);
  }

  @Patch(":id")
  update(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.applications.update(user.id, id, dto);
  }

  @Delete(":id")
  remove(
    @CurrentUser() user: AuthUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.applications.remove(user.id, id);
  }
}
