const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  node: "node.js",
  nodejs: "node.js",
  "node.js": "node.js",
  reactjs: "react",
  "react.js": "react",
  nextjs: "next.js",
  "next.js": "next.js",
  vuejs: "vue",
  "vue.js": "vue",
  postgres: "postgresql",
  psql: "postgresql",
  k8s: "kubernetes",
  gcp: "google cloud",
  "google cloud platform": "google cloud",
  aws: "amazon web services",
  "ci/cd": "ci/cd",
  cicd: "ci/cd",
  html5: "html",
  css3: "css",
  "c#": "c#",
  csharp: "c#",
  "c++": "c++",
  golang: "go",
  rest: "rest apis",
  "rest api": "rest apis",
  "rest apis": "rest apis",
  ml: "machine learning",
  "scikit-learn": "scikit-learn",
  sklearn: "scikit-learn",
  tf: "tensorflow",
  "gh actions": "github actions",
};

export const COMMON_SKILLS = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "ruby",
  "php",
  "c#",
  "c++",
  "sql",
  "html",
  "css",
  "react",
  "next.js",
  "vue",
  "angular",
  "node.js",
  "express",
  "nestjs",
  "django",
  "flask",
  "fastapi",
  "spring",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "elasticsearch",
  "docker",
  "kubernetes",
  "amazon web services",
  "google cloud",
  "azure",
  "terraform",
  "github actions",
  "ci/cd",
  "graphql",
  "rest apis",
  "git",
  "linux",
  "pandas",
  "numpy",
  "machine learning",
  "tensorflow",
  "pytorch",
  "scikit-learn",
  "figma",
  "tailwind css",
  "jest",
  "cypress",
  "playwright",
  "webpack",
  "vite",
  "rabbitmq",
  "kafka",
  "grpc",
  "prometheus",
  "grafana",
];

export function normalizeSkill(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return ALIASES[cleaned] ?? cleaned;
}

export function uniqueNormalized(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = normalizeSkill(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

export function skillInText(skill: string, text: string): boolean {
  const haystack = ` ${text.toLowerCase()} `;
  const needle = normalizeSkill(skill);
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(^|[^a-z0-9+.#])${escaped}([^a-z0-9+.#]|$)`,
    "i",
  );
  return pattern.test(haystack);
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}
