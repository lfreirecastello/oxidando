import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { runInNewContext } from "node:vm";

const root = resolve(import.meta.dirname, "..");
const entry = readFileSync(resolve(root, "index.html"), "utf8");
const html = readFileSync(resolve(root, "docs/index.html"), "utf8");
const css = readFileSync(resolve(root, "docs/assets/styles.css"), "utf8");
const profileScript = readFileSync(resolve(root, "docs/assets/profile.js"), "utf8");
const failures = [];

const requireMatch = (condition, message) => {
  if (!condition) failures.push(message);
};

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
requireMatch(duplicates.length === 0, `Duplicate HTML ids: ${[...new Set(duplicates)].join(", ")}`);

const entryIds = [...entry.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const entryDuplicates = entryIds.filter((id, index) => entryIds.indexOf(id) !== index);
requireMatch(entryDuplicates.length === 0, `Duplicate entry-page ids: ${[...new Set(entryDuplicates)].join(", ")}`);

const fragmentLinks = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const missingFragments = fragmentLinks.filter((fragment) => !ids.includes(fragment));
requireMatch(missingFragments.length === 0, `Missing fragment targets: ${[...new Set(missingFragments)].join(", ")}`);

const entryFragments = [...entry.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const missingEntryFragments = entryFragments.filter((fragment) => !entryIds.includes(fragment));
requireMatch(missingEntryFragments.length === 0, `Missing entry-page fragment targets: ${[...new Set(missingEntryFragments)].join(", ")}`);

for (const asset of ["docs/assets/styles.css", "docs/assets/app.js", "docs/assets/profile.js", "docs/.nojekyll"]) {
  requireMatch(existsSync(resolve(root, asset)), `Missing site asset: ${asset}`);
}

requireMatch(entry.includes('id="profile-form"'), "Root Pages entry point must contain the course builder");
requireMatch(entry.includes('action="docs/"'), "Course builder must submit to the static course");
for (const language of ["Python", "Java", "JavaScript"]) {
  requireMatch(entry.includes(`>${language}<`), `Course builder is missing language: ${language}`);
}
for (const field of ['name="knowledge"', 'name="language"', 'name="rust"']) {
  requireMatch(entry.includes(field), `Course builder is missing profile field: ${field}`);
}
requireMatch(entry.includes("No account, analytics profile, name, or email is required"), "Course builder must state its privacy boundary");
requireMatch(profileScript.includes("localStorage"), "Course profile must persist locally in the browser");
requireMatch(profileScript.includes("URLSearchParams"), "Course profile must support bookmarkable URL parameters");
requireMatch(!/\b(fetch|XMLHttpRequest|sendBeacon)\b/.test(profileScript), "Course profile must not transmit learner preferences");
requireMatch(html.includes("data-course-page"), "Course page must activate profile adaptation");
requireMatch(html.includes('id="adjust-path"'), "Course page must let learners adjust their path");
requireMatch(html.includes("level-intermediate") && html.includes("level-advanced"), "Course must include selectable depth content");
requireMatch(css.includes('[data-rust-level="advanced"]'), "Course CSS must activate advanced depth content");

const staticPythonLines = html.split("\n").filter((line) => line.includes("Python"));
for (const line of staticPythonLines) {
  requireMatch(line.includes("id=") || line.includes("data-bridge"), `Hard-coded Python reference lacks an adaptation hook: ${line.trim()}`);
}

const renderProfile = (language) => {
  const element = (textContent = "Python") => ({
    textContent,
    href: "",
    dataset: {},
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; }
  });
  const neutralDefaults = {
    "adjust-path": "Adjust path",
    "depth-copy": "Guided path"
  };
  const ids = Object.fromEntries([
    "course-language-label", "hero-language", "active-path", "adjust-path", "depth-copy",
    "orientation-bridge-copy", "bridge-column-heading", "strings-bridge-copy", "vectors-bridge-copy",
    "variables-bridge-meta", "variables-bridge-code", "vectors-bridge-code",
    "functions-bridge-code", "ownership-bridge-code"
  ].map((id) => [id, element(neutralDefaults[id] || "Python")]));
  const coursePage = element();
  const bridgeNames = [element(), element()];
  const glossary = ["function", "binding", "print", "semicolon", "block"].map((key) => {
    const node = element();
    node.dataset.bridgeGlossary = key;
    node.attributes["data-label"] = "Python";
    return node;
  });
  const document = {
    title: "",
    querySelector(selector) {
      if (selector === "#profile-form") return null;
      if (selector === "[data-course-page]") return coursePage;
      return selector.startsWith("#") ? ids[selector.slice(1)] : null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-bridge-name]") return bridgeNames;
      if (selector === "[data-bridge-glossary]") return glossary;
      return [];
    }
  };
  runInNewContext(profileScript, {
    document,
    window: { location: { search: `?knowledge=intermediate&language=${language}&rust=basic` } },
    localStorage: { getItem: () => null, setItem: () => {} },
    URLSearchParams,
    FormData,
    JSON,
    Object
  });
  return [document.title, ...Object.values(ids).map((node) => node.textContent),
    ...bridgeNames.map((node) => node.textContent),
    ...glossary.flatMap((node) => [node.textContent, node.attributes["data-label"]])].join("\n");
};

const javaProfile = renderProfile("java");
requireMatch(javaProfile.includes("Java to Rust"), "Java profile title did not adapt");
requireMatch(javaProfile.includes("System.out.println()") && javaProfile.includes("ArrayList"), "Java comparison content did not adapt");
requireMatch(!javaProfile.includes("Python"), "Java profile still contains a Python reference");

const javascriptProfile = renderProfile("javascript");
requireMatch(javascriptProfile.includes("JavaScript to Rust"), "JavaScript profile title did not adapt");
requireMatch(javascriptProfile.includes("console.log()"), "JavaScript comparison content did not adapt");
requireMatch(!javascriptProfile.includes("Python"), "JavaScript profile still contains a Python reference");

const pythonProfile = renderProfile("python");
requireMatch(pythonProfile.includes("Python to Rust") && pythonProfile.includes("print()"), "Python comparison content did not render");

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
