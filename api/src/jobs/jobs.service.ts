import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { paginated, PaginatedResult } from "../common/pagination";
import { uniqueNormalized } from "../matching/skills";
import { CreateJobDto } from "./dto/create-job.dto";
import { ListJobsQueryDto } from "./dto/list-jobs.query";
import { Job } from "./job.entity";
import { SavedJob } from "./saved-job.entity";

export type JobListItem = Job & { saved: boolean };

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobs: Repository<Job>,
    @InjectRepository(SavedJob)
    private readonly savedJobs: Repository<SavedJob>,
  ) {}

  async list(
    userId: string,
    query: ListJobsQueryDto,
  ): Promise<PaginatedResult<JobListItem>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const qb = this.jobs.createQueryBuilder("job");

    if (query.title) {
      qb.andWhere("job.title ILIKE :title", { title: `%${query.title}%` });
    }
    if (query.location) {
      qb.andWhere("job.location ILIKE :location", {
        location: `%${query.location}%`,
      });
    }
    if (query.employmentType) {
      qb.andWhere("job.employmentType = :employmentType", {
        employmentType: query.employmentType,
      });
    }
    if (query.skills) {
      const skills = uniqueNormalized(query.skills.split(","));
      qb.andWhere(
        new Brackets((where) => {
          skills.forEach((skill, index) => {
            where.orWhere(
              `EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(job."requiredSkills") AS req
                WHERE lower(req) LIKE :skill${index}
              ) OR EXISTS (
                SELECT 1 FROM jsonb_array_elements_text(job."preferredSkills") AS pref
                WHERE lower(pref) LIKE :skill${index}
              )`,
              { [`skill${index}`]: `%${skill}%` },
            );
          });
        }),
      );
    }

    if (query.saved) {
      qb.innerJoin(SavedJob, "saved", "saved.jobId = job.id AND saved.userId = :userId", {
        userId,
      });
    }

    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder ?? "DESC";
    qb.orderBy(`job.${sortBy}`, sortOrder);
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [rows, total] = await qb.getManyAndCount();
    const savedIds = await this.savedIdSet(
      userId,
      rows.map((job) => job.id),
    );

    return paginated(
      rows.map((job) => Object.assign(job, { saved: savedIds.has(job.id) })),
      total,
      page,
      pageSize,
    );
  }

  async get(userId: string, id: string): Promise<JobListItem> {
    const job = await this.jobs.findOne({ where: { id } });
    if (!job) throw new NotFoundException("Job not found");
    const saved = await this.savedJobs.existsBy({ userId, jobId: id });
    return Object.assign(job, { saved });
  }

  async createManual(dto: CreateJobDto): Promise<Job> {
    const job = this.jobs.create({
      ...dto,
      requiredSkills: uniqueNormalized(dto.requiredSkills),
      preferredSkills: uniqueNormalized(dto.preferredSkills ?? []),
      source: "manual",
      sourceUrl: null,
    });
    return this.jobs.save(job);
  }

  async saveJob(userId: string, jobId: string): Promise<SavedJob> {
    await this.get(userId, jobId);
    const existing = await this.savedJobs.findOne({
      where: { userId, jobId },
    });
    if (existing) return existing;
    return this.savedJobs.save(this.savedJobs.create({ userId, jobId }));
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const existing = await this.savedJobs.findOne({
      where: { userId, jobId },
    });
    if (!existing) {
      throw new ConflictException("Job is not saved");
    }
    await this.savedJobs.remove(existing);
  }

  async listSaved(userId: string): Promise<JobListItem[]> {
    const rows = await this.savedJobs.find({
      where: { userId },
      relations: { job: true },
      order: { createdAt: "DESC" },
    });
    return rows
      .filter((row) => row.job)
      .map((row) => Object.assign(row.job, { saved: true }));
  }

  private async savedIdSet(userId: string, jobIds: string[]): Promise<Set<string>> {
    if (jobIds.length === 0) return new Set();
    const rows = await this.savedJobs
      .createQueryBuilder("saved")
      .select("saved.jobId", "jobId")
      .where("saved.userId = :userId", { userId })
      .andWhere("saved.jobId IN (:...jobIds)", { jobIds })
      .getRawMany<{ jobId: string }>();
    return new Set(rows.map((row) => row.jobId));
  }
}
