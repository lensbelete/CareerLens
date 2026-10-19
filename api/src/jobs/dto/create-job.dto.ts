import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { EMPLOYMENT_TYPES } from "../job.entity";

export class CreateJobDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  company!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  location!: string;

  @IsIn(EMPLOYMENT_TYPES)
  employmentType!: (typeof EMPLOYMENT_TYPES)[number];

  @IsString()
  @MinLength(20)
  @MaxLength(12_000)
  description!: string;

  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  requiredSkills!: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  preferredSkills?: string[];
}
