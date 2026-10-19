import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import { Profile } from "../profiles/profile.entity";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  const users = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const profiles = {
    create: jest.fn((value: unknown) => value),
    save: jest.fn(),
  };
  const jwt = {
    signAsync: jest.fn().mockResolvedValue("token"),
  };

  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
        { provide: getRepositoryToken(Profile), useValue: profiles },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it("rejects duplicate emails", async () => {
    users.findByEmail.mockResolvedValue({ id: "1" });
    await expect(
      service.register({
        email: "a@example.com",
        fullName: "A",
        password: "password1",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("hashes passwords and creates a blank profile", async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({
      id: "u1",
      email: "a@example.com",
      fullName: "A",
    });

    const result = await service.register({
      email: "a@example.com",
      fullName: "A",
      password: "password1",
    });

    expect(result.accessToken).toBe("token");
    expect(profiles.save).toHaveBeenCalled();
    const created = users.create.mock.calls[0][0] as { passwordHash: string };
    expect(created.passwordHash).not.toBe("password1");
    await expect(bcrypt.compare("password1", created.passwordHash)).resolves.toBe(
      true,
    );
  });

  it("rejects bad passwords without leaking whether the email exists", async () => {
    users.findByEmail.mockResolvedValue({
      id: "u1",
      email: "a@example.com",
      fullName: "A",
      passwordHash: await bcrypt.hash("other-pass", 4),
    });
    await expect(
      service.login({ email: "a@example.com", password: "nope" }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
