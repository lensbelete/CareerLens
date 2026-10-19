import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Job } from "./job.entity";
import { JobsService } from "./jobs.service";
import { SavedJob } from "./saved-job.entity";

describe("JobsService", () => {
  const jobsRepo = {
    create: jest.fn((value: unknown) => value),
    save: jest.fn(async (value: unknown) => ({ id: "job-1", ...(value as object) })),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const savedRepo = {
    existsBy: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value: unknown) => value),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  let service: JobsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getRepositoryToken(Job), useValue: jobsRepo },
        { provide: getRepositoryToken(SavedJob), useValue: savedRepo },
      ],
    }).compile();
    service = module.get(JobsService);
  });

  it("stores manual jobs as source=manual with normalized skills", async () => {
    const job = await service.createManual({
      title: "Backend Engineer",
      company: "Harbor",
      location: "London",
      employmentType: "full-time",
      description: "A".repeat(24),
      requiredSkills: ["NodeJS", "node.js"],
      preferredSkills: ["Redis"],
    });
    expect(job.source).toBe("manual");
    expect(job.requiredSkills).toEqual(["node.js"]);
  });
});
