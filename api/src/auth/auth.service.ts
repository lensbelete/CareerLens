import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Profile } from "../profiles/profile.entity";
import { UsersService } from "../users/users.service";
import { AuthUser } from "./auth-user";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.users.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("An account with that email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.users.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
    });

    const profile = this.profiles.create({
      userId: user.id,
      skills: [],
      education: [],
      experience: [],
      projects: [],
    });
    await this.profiles.save(profile);

    return this.issue(user.id, user.email, user.fullName);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.issue(user.id, user.email, user.fullName);
  }

  private async issue(
    id: string,
    email: string,
    fullName: string,
  ): Promise<AuthResponse> {
    const accessToken = await this.jwt.signAsync({ sub: id, email });
    return { accessToken, user: { id, email, fullName } };
  }
}
