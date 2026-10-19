import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "../jobs/job.entity";
import { Application, ApplicationStatus } from "./application.entity";
import { UpdateApplicationDto } from "./dto/update-application.dto";
import { UpsertApplicationDto } from "./dto/upsert-application.dto";

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applications: Repository<Application>,
    @InjectRepository(Job)
    private readonly jobs: Repository<Job>,
  ) {}

  async list(userId: string, status?: ApplicationStatus): Promise<Application[]> {
    return this.applications.find({
      where: status ? { userId, status } : { userId },
      relations: { job: true },
      order: { updatedAt: "DESC" },
    });
  }

  async upsert(userId: string, dto: UpsertApplicationDto): Promise<Application> {
    const job = await this.jobs.findOne({ where: { id: dto.jobId } });
    if (!job) throw new NotFoundException("Job not found");

    let application = await this.applications.findOne({
      where: { userId, jobId: dto.jobId },
      relations: { job: true },
    });

    if (!application) {
      application = this.applications.create({
        userId,
        jobId: dto.jobId,
        status: dto.status ?? "applied",
        notes: dto.notes ?? "",
      });
    } else {
      if (dto.status) application.status = dto.status;
      if (dto.notes !== undefined) application.notes = dto.notes;
    }

    this.touchDates(application);
    await this.applications.save(application);
    return this.getOwned(userId, application.id);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateApplicationDto,
  ): Promise<Application> {
    const application = await this.getOwned(userId, id);
    if (dto.status) application.status = dto.status;
    if (dto.notes !== undefined) application.notes = dto.notes;
    if (dto.interviewAt !== undefined) {
      application.interviewAt = dto.interviewAt
        ? new Date(dto.interviewAt)
        : null;
    }
    this.touchDates(application);
    await this.applications.save(application);
    return this.getOwned(userId, application.id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const application = await this.getOwned(userId, id);
    await this.applications.remove(application);
  }

  async counts(userId: string): Promise<Record<ApplicationStatus, number>> {
    const rows = await this.applications
      .createQueryBuilder("application")
      .select("application.status", "status")
      .addSelect("COUNT(*)", "count")
      .where("application.userId = :userId", { userId })
      .groupBy("application.status")
      .getRawMany<{ status: ApplicationStatus; count: string }>();

    const result: Record<ApplicationStatus, number> = {
      saved: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };
    for (const row of rows) {
      result[row.status] = Number(row.count);
    }
    return result;
  }

  private async getOwned(userId: string, id: string): Promise<Application> {
    const application = await this.applications.findOne({
      where: { id, userId },
      relations: { job: true },
    });
    if (!application) {
      throw new NotFoundException("Application not found");
    }
    return application;
  }

  private touchDates(application: Application): void {
    if (application.status === "applied" && !application.appliedAt) {
      application.appliedAt = new Date();
    }
    if (application.status === "interview" && !application.interviewAt) {
      application.interviewAt = new Date();
    }
  }
}
