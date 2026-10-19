import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Profile } from "../profiles/profile.entity";
import { Resume } from "./resume.entity";
import { ResumesService } from "./resumes.service";

describe("ResumesService", () => {
  const resumes = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const profiles = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string) => {
      if (key === "uploadDir") return "/tmp/careerlens-uploads";
      if (key === "maxUploadBytes") return 5 * 1024 * 1024;
      return undefined;
    }),
  };

  let service: ResumesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ResumesService,
        { provide: getRepositoryToken(Resume), useValue: resumes },
        { provide: getRepositoryToken(Profile), useValue: profiles },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    service = module.get(ResumesService);
  });

  it("rejects missing files", async () => {
    await expect(service.upload("u1", undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects non-PDF payloads", async () => {
    await expect(
      service.upload("u1", {
        originalname: "cv.txt",
        mimetype: "text/plain",
        size: 12,
        buffer: Buffer.from("not a pdf"),
      } as Express.Multer.File),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("does not return another user's resume", async () => {
    resumes.findOne.mockResolvedValue(null);
    await expect(service.getOwned("u1", "r1")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(resumes.findOne).toHaveBeenCalledWith({
      where: { id: "r1", userId: "u1" },
    });
  });
});
