import { Profile } from "../profiles/profile.entity";
import {
  buildCandidateSnapshot,
  lexicalSimilarity,
  MATCH_DISCLAIMER,
  scoreMatch,
} from "./matching-engine";

function profile(partial: Partial<Profile> = {}): Profile {
  return {
    id: "p1",
    userId: "u1",
    headline: "Frontend engineer",
    summary: "Builds React apps in TypeScript.",
    location: "London",
    skills: ["TypeScript", "React", "Jest"],
    education: [
      { school: "Example University", degree: "BSc", field: "Computer Science" },
    ],
    experience: [
      {
        title: "Frontend Engineer",
        company: "Acme",
        description: "Shipped Next.js dashboards and CSS design tokens.",
      },
    ],
    projects: [],
    updatedAt: new Date(),
    user: undefined as unknown as Profile["user"],
    ...partial,
  };
}

describe("matching engine", () => {
  it("scores explicit required skills higher than missing ones", () => {
    const candidate = buildCandidateSnapshot(profile(), null);
    const strong = scoreMatch({
      candidate,
      job: {
        title: "Frontend Engineer",
        description: "TypeScript React Next.js",
        requiredSkills: ["TypeScript", "React"],
        preferredSkills: [],
      },
      textSimilarity: 0.4,
      usedEmbeddings: false,
    });
    const weak = scoreMatch({
      candidate,
      job: {
        title: "ML Engineer",
        description: "PyTorch research",
        requiredSkills: ["PyTorch", "Machine Learning"],
        preferredSkills: [],
      },
      textSimilarity: 0.05,
      usedEmbeddings: false,
    });

    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.matchedSkills.every((item) => item.evidence === "explicit")).toBe(
      true,
    );
    expect(weak.missingRequired.map((item) => item.skill)).toEqual(
      expect.arrayContaining(["pytorch", "machine learning"]),
    );
    expect(strong.disclaimer).toBe(MATCH_DISCLAIMER);
    expect(strong.method).toBe("hybrid-lexical");
  });

  it("marks skills found only in experience as inferred", () => {
    const candidate = buildCandidateSnapshot(
      profile({ skills: ["TypeScript"] }),
      null,
    );
    const result = scoreMatch({
      candidate,
      job: {
        title: "Frontend Engineer",
        description: "Next.js experience required",
        requiredSkills: ["Next.js"],
        preferredSkills: [],
      },
      textSimilarity: 0.3,
      usedEmbeddings: false,
    });

    expect(result.matchedSkills[0]).toMatchObject({
      skill: "next.js",
      evidence: "inferred",
    });
  });

  it("does not invent missing experience", () => {
    const candidate = buildCandidateSnapshot(
      profile({ experience: [], projects: [], skills: [] }),
      null,
    );
    const result = scoreMatch({
      candidate,
      job: {
        title: "Backend Engineer",
        description: "Need PostgreSQL",
        requiredSkills: ["PostgreSQL"],
        preferredSkills: ["Redis"],
      },
      textSimilarity: 0,
      usedEmbeddings: false,
    });
    expect(result.matchedSkills).toHaveLength(0);
    expect(result.missingRequired[0].skill).toBe("postgresql");
    expect(result.recommendations[0].generatedBy).toBe("deterministic");
  });

  it("computes a stable lexical similarity", () => {
    const high = lexicalSimilarity(
      "typescript react next.js dashboard",
      "frontend typescript react next.js",
    );
    const low = lexicalSimilarity("typescript react", "pytorch cuda training");
    expect(high).toBeGreaterThan(low);
    expect(high).toBeGreaterThan(0.2);
  });
});
