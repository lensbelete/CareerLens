import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { Repository } from "typeorm";
import { AppConfig } from "../config/configuration";
import { Profile } from "../profiles/profile.entity";
import { parseResumeText } from "./resume-parser";
import { Resume } from "./resume.entity";

const PDF_MAGIC = Buffer.from("%PDF");

@Injectable()
export class ResumesService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumes: Repository<Resume>,
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  list(userId: string): Promise<Resume[]> {
    return this.resumes.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async getOwned(userId: string, id: string): Promise<Resume> {
    const resume = await this.resumes.findOne({ where: { id, userId } });
    if (!resume) {
      throw new NotFoundException("Resume not found");
    }
    return resume;
  }

  async upload(
    userId: string,
    file: Express.Multer.File | undefined,
  ): Promise<Resume> {
    this.assertPdf(file);
    const uploadDir = path.resolve(
      this.config.get("uploadDir", { infer: true }),
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const storageKey = `${userId}/${randomUUID()}.pdf`;
    const absolute = path.join(uploadDir, storageKey);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, file.buffer);

    let extractedText: string | null = null;
    try {
      extractedText = await extractPdfText(file.buffer);
    } catch {
      extractedText = null;
    }

    const parsedData = extractedText ? parseResumeText(extractedText) : null;
    const existingCount = await this.resumes.count({ where: { userId } });

    const resume = this.resumes.create({
      userId,
      originalFilename: file.originalname,
      storageKey,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      extractedText,
      parsedData,
      isActive: existingCount === 0,
    });
    const saved = await this.resumes.save(resume);

    if (saved.isActive && parsedData) {
      await this.mergeParsedIntoEmptyProfile(userId, parsedData);
    }

    return saved;
  }

  async setActive(userId: string, id: string): Promise<Resume> {
    const resume = await this.getOwned(userId, id);
    await this.resumes.update({ userId }, { isActive: false });
    resume.isActive = true;
    return this.resumes.save(resume);
  }

  async remove(userId: string, id: string): Promise<void> {
    const resume = await this.getOwned(userId, id);
    const uploadDir = path.resolve(
      this.config.get("uploadDir", { infer: true }),
    );
    await this.resumes.remove(resume);
    await fs.unlink(path.join(uploadDir, resume.storageKey)).catch(() => undefined);

    if (resume.isActive) {
      const latest = await this.resumes.findOne({
        where: { userId },
        order: { createdAt: "DESC" },
      });
      if (latest) {
        latest.isActive = true;
        await this.resumes.save(latest);
      }
    }
  }

  async getActive(userId: string): Promise<Resume | null> {
    return this.resumes.findOne({ where: { userId, isActive: true } });
  }

  private assertPdf(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
    if (!file) {
      throw new BadRequestException("A PDF file is required");
    }
    const maxBytes = this.config.get("maxUploadBytes", { infer: true });
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File exceeds the ${Math.round(maxBytes / 1024 / 1024)}MB limit`,
      );
    }
    const isPdfMime =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");
    const isPdfMagic = file.buffer.subarray(0, 4).equals(PDF_MAGIC);
    if (!isPdfMime || !isPdfMagic) {
      throw new BadRequestException("Only PDF files are accepted");
    }
  }

  private async mergeParsedIntoEmptyProfile(
    userId: string,
    parsed: NonNullable<Resume["parsedData"]>,
  ): Promise<void> {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) return;

    const empty =
      profile.skills.length === 0 &&
      profile.education.length === 0 &&
      profile.experience.length === 0 &&
      profile.projects.length === 0 &&
      !profile.summary;

    if (!empty) return;

    profile.skills = parsed.skills;
    profile.education = parsed.education;
    profile.experience = parsed.experience;
    profile.projects = parsed.projects;
    await this.profiles.save(profile);
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const loaded = await import("pdf-parse");
  const pdfParse =
    (loaded as { default?: (input: Buffer) => Promise<{ text: string }> })
      .default ??
    (loaded as unknown as (input: Buffer) => Promise<{ text: string }>);
  const result = await pdfParse(buffer);
  return result.text.split("\0").join("").trim();
}
