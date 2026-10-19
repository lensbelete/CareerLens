import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { AppDataSource } from "../data-source";
import { Job } from "../../jobs/job.entity";
import { Profile } from "../../profiles/profile.entity";
import { User } from "../../users/user.entity";
import { SAMPLE_JOBS } from "./sample-jobs";

const DEMO_EMAIL = "demo@careerlens.dev";
const DEMO_PASSWORD = "DemoPass123!";

async function seed() {
  await AppDataSource.initialize();
  const jobs = AppDataSource.getRepository(Job);
  const users = AppDataSource.getRepository(User);
  const profiles = AppDataSource.getRepository(Profile);

  const existingJobs = await jobs.count();
  if (existingJobs === 0) {
    await jobs.save(jobs.create(SAMPLE_JOBS));
    console.log(`Inserted ${SAMPLE_JOBS.length} sample jobs.`);
  } else {
    console.log(`Jobs table already has ${existingJobs} rows; skipping job seed.`);
  }

  let demo = await users.findOne({ where: { email: DEMO_EMAIL } });
  if (!demo) {
    demo = await users.save(
      users.create({
        email: DEMO_EMAIL,
        fullName: "Alex Demo",
        passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
      }),
    );
    await profiles.save(
      profiles.create({
        userId: demo.id,
        headline: "Full-stack engineer (sample profile)",
        summary:
          "Sample profile for local development. TypeScript, React, and Node.js across product teams. Not a real person.",
        location: "London, UK",
        skills: [
          "TypeScript",
          "JavaScript",
          "React",
          "Node.js",
          "PostgreSQL",
          "Docker",
          "Jest",
        ],
        education: [
          {
            school: "University of Example",
            degree: "BSc",
            field: "Computer Science",
            startDate: "2014",
            endDate: "2017",
          },
        ],
        experience: [
          {
            title: "Software Engineer",
            company: "Sample Studio",
            startDate: "2021",
            endDate: "Present",
            description:
              "Built TypeScript APIs and React clients. Wrote Jest coverage and reviewed PostgreSQL migrations.",
          },
        ],
        projects: [
          {
            name: "Internal reporting UI",
            description: "Next.js dashboard with filtered tables and CSV export.",
            technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
          },
        ],
      }),
    );
    console.log(`Created demo user ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  } else {
    console.log(`Demo user ${DEMO_EMAIL} already exists.`);
  }

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
