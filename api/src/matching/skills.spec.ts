import { normalizeSkill, skillInText, uniqueNormalized } from "./skills";

describe("skill helpers", () => {
  it("normalizes aliases", () => {
    expect(normalizeSkill("JS")).toBe("javascript");
    expect(normalizeSkill("NodeJS")).toBe("node.js");
    expect(normalizeSkill("k8s")).toBe("kubernetes");
  });

  it("deduplicates after aliasing", () => {
    expect(uniqueNormalized(["JS", "JavaScript", "javascript"])).toEqual([
      "javascript",
    ]);
  });

  it("matches whole skill tokens in text", () => {
    expect(skillInText("node.js", "Built APIs with Node.js and PostgreSQL")).toBe(
      true,
    );
    expect(skillInText("java", "javascript is used")).toBe(false);
  });
});
