import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { APPLICATION_STATUSES } from "../application.entity";

export class UpsertApplicationDto {
  @IsUUID()
  jobId!: string;

  @IsOptional()
  @IsIn(APPLICATION_STATUSES)
  status?: (typeof APPLICATION_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;
}
