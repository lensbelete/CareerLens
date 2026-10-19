import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Job } from "../jobs/job.entity";
import { Application } from "./application.entity";
import { ApplicationsService } from "./applications.service";

describe("ApplicationsService", () => {
  const applications = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((value: unknown) => value),
    save: jest.fn(async (value: unknown) => value),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
  const jobs = {
    findOne: jest.fn(),
  };

  let service: ApplicationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: getRepositoryToken(Application), useValue: applications },
        { provide: getRepositoryToken(Job), useValue: jobs },
      ],
    }).compile();
    service = module.get(ApplicationsService);
  });

  it("does not allow creating an application for a missing job", async () => {
    jobs.findOne.mockResolvedValue(null);
    await expect(
      service.upsert("user-1", { jobId: "job-1", status: "applied" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("scopes updates to the owning user", async () => {
    applications.findOne.mockResolvedValue(null);
    await expect(
      service.update("user-1", "app-9", { status: "interview" }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(applications.findOne).toHaveBeenCalledWith({
      where: { id: "app-9", userId: "user-1" },
      relations: { job: true },
    });
  });
});
