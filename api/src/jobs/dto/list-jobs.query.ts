import { Type } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../common/pagination";
import { EMPLOYMENT_TYPES } from "../job.entity";

export class ListJobsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  skills?: string;

  @IsOptional()
  @IsIn(EMPLOYMENT_TYPES)
  employmentType?: (typeof EMPLOYMENT_TYPES)[number];

  @IsOptional()
  @IsIn(["createdAt", "title", "company"])
  sortBy: "createdAt" | "title" | "company" = "createdAt";

  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder: "ASC" | "DESC" = "DESC";

  @IsOptional()
  @Type(() => Boolean)
  saved?: boolean;
}
