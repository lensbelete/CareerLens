import assert from "node:assert/strict";

function employmentLabel(value) {
  return value.replace("-", " ");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function scoreTone(score) {
  if (score >= 70) return "text-pine bg-[#eef3ee]";
  if (score >= 45) return "text-brass bg-[#f6eedc]";
  return "text-[#7a2e24] bg-[#f8ece9]";
}

assert.equal(employmentLabel("full-time"), "full time");
assert.equal(formatBytes(512), "512 B");
assert.equal(formatBytes(2048).endsWith("KB"), true);
assert.equal(scoreTone(80), "text-pine bg-[#eef3ee]");
assert.equal(scoreTone(20), "text-[#7a2e24] bg-[#f8ece9]");
console.log("format tests passed");
