import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsOptional, IsUUID } from "class-validator";
import { Repository } from "typeorm";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthUser } from "../auth/auth-user";
import { Job } from "../jobs/job.entity";
import { MatchingService } from "../matching/matching.service";

class GapsQuery {
  @IsOptional()
  @IsUUID()
  jobId?: string;
}

@Controller("skills")
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(
    private readonly matching: MatchingService,
    @InjectRepository(Job)
    private readonly jobs: Repository<Job>,
  ) {}

  @Get("gaps")
  async gaps(@CurrentUser() user: AuthUser, @Query() query: GapsQuery) {
    if (query.jobId) {
      const match = await this.matching.matchJob(user.id, query.jobId);
      const job = await this.jobs.findOneByOrFail({ id: query.jobId });
      return { job, match, aggregated: null };
    }

    const jobs = await this.jobs.find({
      order: { createdAt: "DESC" },
      take: 16,
    });
    const tally = new Map<
      string,
      { skill: string; kind: "required" | "preferred"; jobTitles: string[] }
    >();
    const perJob = [];

    for (const job of jobs) {
      const match = await this.matching.matchAgainst(user.id, job);
      perJob.push({
        job: { id: job.id, title: job.title, company: job.company },
        score: match.score,
        missingRequired: match.missingRequired,
        missingPreferred: match.missingPreferred,
        recommendations: match.recommendations,
      });
      for (const item of match.missingRequired) {
        const current = tally.get(item.skill) ?? {
          skill: item.skill,
          kind: "required" as const,
          jobTitles: [],
        };
        current.jobTitles.push(job.title);
        tally.set(item.skill, current);
      }
      for (const item of match.missingPreferred) {
        if (tally.has(item.skill)) continue;
        const current = tally.get(item.skill) ?? {
          skill: item.skill,
          kind: "preferred" as const,
          jobTitles: [],
        };
        current.jobTitles.push(job.title);
        tally.set(item.skill, current);
      }
    }

    const aggregated = [...tally.values()].sort(
      (a, b) => b.jobTitles.length - a.jobTitles.length,
    );

    return { job: null, match: null, aggregated, perJob };
  }
}
