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
  if (score >= 70) return "text-teal-800 bg-teal-50";
  if (score >= 45) return "text-amber-800 bg-amber-50";
  return "text-rose-800 bg-rose-50";
}

assert.equal(employmentLabel("full-time"), "full time");
assert.equal(formatBytes(512), "512 B");
assert.equal(formatBytes(2048).endsWith("KB"), true);
assert.equal(scoreTone(80).includes("teal"), true);
assert.equal(scoreTone(20).includes("rose"), true);
console.log("format tests passed");
