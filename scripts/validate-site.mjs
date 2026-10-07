import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const entry = readFileSync(resolve(root, "index.html"), "utf8");
const html = readFileSync(resolve(root, "docs/index.html"), "utf8");
const css = readFileSync(resolve(root, "docs/assets/styles.css"), "utf8");
const failures = [];

const requireMatch = (condition, message) => {
  if (!condition) failures.push(message);
};

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
requireMatch(duplicates.length === 0, `Duplicate HTML ids: ${[...new Set(duplicates)].join(", ")}`);

const fragmentLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const missingFragments = fragmentLinks.filter((fragment) => !ids.includes(fragment));
requireMatch(missingFragments.length === 0, `Missing fragment targets: ${[...new Set(missingFragments)].join(", ")}`);

for (const asset of ["docs/assets/styles.css", "docs/assets/app.js", "docs/.nojekyll"]) {
  requireMatch(existsSync(resolve(root, asset)), `Missing site asset: ${asset}`);
}

requireMatch(entry.includes('url=docs/'), "Root Pages entry point must redirect to the static course");
requireMatch(entry.includes('href="docs/"'), "Root Pages entry point requires a usable fallback link");

const requiredChallengeText = [
  "let mut customer = String::from(\"Acme\");",
  "let preview = customer.as_str();",
  "customer.push_str(\" | ready\");",
  "println!(\"Preview: {preview}\");",
  "println!(\"Payload: {customer}\");",
  "Preview: Acme",
  "Payload: Acme | ready"
];
for (const text of requiredChallengeText) {
  requireMatch(html.includes(text), `Challenge content changed or missing: ${text}`);
}

requireMatch(!html.includes("preview.clone()"), "Challenge must not reveal a clone-based workaround");
const requiredFoundationText = [
  "Read your first Rust program",
  "Variables are stable by default",
  "Strings, associated functions, and methods",
  "growable typed sequence",
  "Functions make types and returns visible",
  "Ownership decides who cleans up",
  "Borrow instead of transferring ownership",
  "Word you just met · binding",
  "Expected output"
];
for (const text of requiredFoundationText) {
  requireMatch(html.includes(text), `Foundation lesson content missing: ${text}`);
}

requireMatch(html.includes('name="viewport"'), "Viewport metadata is required");
requireMatch(html.includes("Skip to lesson"), "Skip link is required");
requireMatch(html.includes("aria-label=\"Mobile course navigation\""), "Accessible mobile navigation is required");
requireMatch(css.includes("@media (max-width: 640px)"), "Phone breakpoint is required");
requireMatch(css.includes("@media (max-width: 370px)"), "Narrow-phone breakpoint is required");
requireMatch(css.includes("safe-area-inset"), "Safe-area support is required");
requireMatch(css.includes("prefers-reduced-motion"), "Reduced-motion support is required");
requireMatch(css.includes("overflow-x: auto"), "Code overflow containment is required");
requireMatch(css.includes("min-width: 320px"), "Small-screen width guard is required");

if (failures.length) {
  console.error("Site validation failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Site validation passed: ${ids.length} unique ids, ${fragmentLinks.length} internal links, challenge integrity preserved.`);
