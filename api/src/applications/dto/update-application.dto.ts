import { IsIn, IsISO8601, IsOptional, IsString, MaxLength } from "class-validator";
import { APPLICATION_STATUSES } from "../application.entity";

export class UpdateApplicationDto {
  @IsOptional()
  @IsIn(APPLICATION_STATUSES)
  status?: (typeof APPLICATION_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  notes?: string;

  @IsOptional()
  @IsISO8601()
  interviewAt?: string | null;
}
