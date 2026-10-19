import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";

const databaseAvailable = Boolean(process.env.DATABASE_HOST || process.env.RUN_E2E);

describe("CareerLens API (e2e)", () => {
  let app: INestApplication;
  let token = "";
  let otherToken = "";
  let jobId = "";
  let applicationId = "";

  beforeAll(async () => {
    if (!databaseAvailable) return;
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it("reports health", async () => {
    if (!databaseAvailable) return;
    const response = await request(app.getHttpServer()).get("/health").expect(200);
    expect(response.body.database).toBe("up");
  });

  it("registers, logs in, and rejects duplicate emails", async () => {
    if (!databaseAvailable) return;
    const suffix = Date.now();
    const email = `e2e-${suffix}@careerlens.dev`;
    const register = await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email, fullName: "E2E User", password: "Password123" })
      .expect(201);
    token = register.body.accessToken;
    expect(token).toBeTruthy();

    await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email, fullName: "E2E User", password: "Password123" })
      .expect(409);

    const login = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: "Password123" })
      .expect(201);
    expect(login.body.accessToken).toBeTruthy();

    const other = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: `e2e-other-${suffix}@careerlens.dev`,
        fullName: "Other User",
        password: "Password123",
      })
      .expect(201);
    otherToken = other.body.accessToken;
  });

  it("creates a job, matches it, and keeps applications private", async () => {
    if (!databaseAvailable) return;
    const created = await request(app.getHttpServer())
      .post("/jobs")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "E2E Backend Engineer",
        company: "Test Co",
        location: "Remote",
        employmentType: "remote",
        description: "SAMPLE LISTING for automated tests. Requires Node.js and PostgreSQL.",
        requiredSkills: ["Node.js", "PostgreSQL"],
        preferredSkills: ["Redis"],
      })
      .expect(201);
    jobId = created.body.id;

    const listed = await request(app.getHttpServer())
      .get("/jobs?title=E2E")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data.some((job: { id: string }) => job.id === jobId)).toBe(true);

    const match = await request(app.getHttpServer())
      .get(`/jobs/${jobId}/match`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(match.body.disclaimer).toContain("not an estimate of hiring probability");
    expect(typeof match.body.score).toBe("number");

    const application = await request(app.getHttpServer())
      .post("/applications")
      .set("Authorization", `Bearer ${token}`)
      .send({ jobId, status: "applied", notes: "sent" })
      .expect(201);
    applicationId = application.body.id;

    await request(app.getHttpServer())
      .patch(`/applications/${applicationId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ status: "interview" })
      .expect(404);
  });
});
