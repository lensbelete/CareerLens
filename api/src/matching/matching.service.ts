import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "../jobs/job.entity";
import { Profile } from "../profiles/profile.entity";
import { Resume } from "../resumes/resume.entity";
import { EmbeddingsService } from "./embeddings.service";
import {
  buildCandidateSnapshot,
  candidateDocument,
  cosine,
  lexicalSimilarity,
  MatchResult,
  scoreMatch,
} from "./matching-engine";

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(Job)
    private readonly jobs: Repository<Job>,
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    @InjectRepository(Resume)
    private readonly resumes: Repository<Resume>,
    private readonly embeddings: EmbeddingsService,
  ) {}

  async matchJob(userId: string, jobId: string): Promise<MatchResult> {
    const job = await this.jobs.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException("Job not found");
    return this.matchAgainst(userId, job);
  }

  async matchAgainst(userId: string, job: Job): Promise<MatchResult> {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException("Profile not found");
    const resume = await this.resumes.findOne({
      where: { userId, isActive: true },
    });

    const candidate = buildCandidateSnapshot(profile, resume);
    const left = candidateDocument(candidate);
    const right = `${job.title}\n${job.description}\n${job.requiredSkills.join(" ")}\n${job.preferredSkills.join(" ")}`;

    let textSimilarity = lexicalSimilarity(left, right);
    let usedEmbeddings = false;

    const [leftVec, rightVec] = await Promise.all([
      this.embeddings.embed(left),
      this.embeddings.embed(right),
    ]);
    if (leftVec && rightVec) {
      textSimilarity = cosine(leftVec, rightVec);
      usedEmbeddings = true;
    }

    return scoreMatch({
      candidate,
      job: {
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
        preferredSkills: job.preferredSkills,
      },
      textSimilarity,
      usedEmbeddings,
    });
  }
}
