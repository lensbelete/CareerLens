import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { Profile } from "./profile.entity";

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
  ) {}

  async getForUser(userId: string): Promise<Profile> {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    return profile;
  }

  async update(userId: string, dto: UpdateProfileDto): Promise<Profile> {
    const profile = await this.getForUser(userId);

    if (dto.headline !== undefined) profile.headline = dto.headline;
    if (dto.summary !== undefined) profile.summary = dto.summary;
    if (dto.location !== undefined) profile.location = dto.location;
    if (dto.skills !== undefined) {
      profile.skills = uniqueTrimmed(dto.skills);
    }
    if (dto.education !== undefined) profile.education = dto.education;
    if (dto.experience !== undefined) profile.experience = dto.experience;
    if (dto.projects !== undefined) {
      profile.projects = dto.projects.map((project) => ({
        ...project,
        technologies: uniqueTrimmed(project.technologies ?? []),
      }));
    }

    return this.profiles.save(profile);
  }
}

function uniqueTrimmed(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}
