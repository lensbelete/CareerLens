import { parseResumeText } from "./resume-parser";

const SAMPLE = `
Jane Example
London

Skills
TypeScript, React, PostgreSQL, Docker

Experience
Frontend Engineer at Sample Studio
January 2021 Present
Built React clients and TypeScript APIs.

Education
University of Example
BSc in Computer Science 2014 2017

Projects
Reporting dashboard
Next.js tables with CSV export
`;

describe("resume parser", () => {
  it("extracts listed sections and does not invent missing ones", () => {
    const parsed = parseResumeText(SAMPLE);
    expect(parsed.skills).toEqual(
      expect.arrayContaining(["TypeScript", "React", "PostgreSQL", "Docker"]),
    );
    expect(parsed.experience[0]?.title).toMatch(/Frontend Engineer/i);
    expect(parsed.education[0]?.school).toMatch(/University of Example/i);
    expect(parsed.projects[0]?.name).toMatch(/Reporting dashboard/i);
  });

  it("returns empty collections when sections are absent", () => {
    const parsed = parseResumeText("Just a name and an email.\nhello@example.com");
    expect(parsed.skills).toEqual([]);
    expect(parsed.education).toEqual([]);
    expect(parsed.experience).toEqual([]);
    expect(parsed.projects).toEqual([]);
  });
});
