import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApplicationsService } from "../applications/applications.service";
import { Job } from "../jobs/job.entity";
import { SavedJob } from "../jobs/saved-job.entity";
import { MatchingService } from "../matching/matching.service";
import { Profile } from "../profiles/profile.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Job)
    private readonly jobs: Repository<Job>,
    @InjectRepository(SavedJob)
    private readonly savedJobs: Repository<SavedJob>,
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    private readonly applications: ApplicationsService,
    private readonly matching: MatchingService,
  ) {}

  async summarize(userId: string) {
    const [applicationCounts, savedCount, recentJobs, profile] =
      await Promise.all([
        this.applications.counts(userId),
        this.savedJobs.count({ where: { userId } }),
        this.jobs.find({ order: { createdAt: "DESC" }, take: 5 }),
        this.profiles.findOne({ where: { userId } }),
      ]);

    const candidateJobs = await this.jobs.find({
      order: { createdAt: "DESC" },
      take: 8,
    });

    const recommendations = [];
    const gapTally = new Map<string, number>();

    for (const job of candidateJobs) {
      const match = await this.matching.matchAgainst(userId, job);
      recommendations.push({
        job,
        score: match.score,
        method: match.method,
        missingRequired: match.missingRequired.slice(0, 4),
      });
      for (const missing of match.missingRequired) {
        gapTally.set(missing.skill, (gapTally.get(missing.skill) ?? 0) + 1);
      }
    }

    recommendations.sort((a, b) => b.score - a.score);

    const skillGaps = [...gapTally.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill, jobCount]) => ({ skill, jobCount }));

    const relevantMatches = recommendations.filter((item) => item.score >= 50)
      .length;

    return {
      totals: {
        relevantMatches,
        savedJobs: savedCount,
        activeApplications:
          applicationCounts.applied + applicationCounts.interview,
        interviews: applicationCounts.interview,
        offers: applicationCounts.offer,
      },
      applicationCounts,
      recentJobs,
      recommended: recommendations.slice(0, 4),
      skillGaps,
      profileReady: Boolean(
        profile &&
          (profile.skills.length > 0 ||
            profile.experience.length > 0 ||
            profile.summary),
      ),
    };
  }
}
