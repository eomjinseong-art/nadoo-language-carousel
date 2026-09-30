// Scans published content (and optionally the built site) for banned personal info.
// Usage: node scripts/check-anonymity.mjs [extraDir ...]
import fs from "node:fs";
import path from "node:path";
import { findViolations, requirePrivateTerms } from "./lib/anonymity.mjs";

requirePrivateTerms();

const root = process.cwd();
const dirs = [path.join(root, "content"), path.join(root, "app"), path.join(root, "components"), path.join(root, "lib"), path.join(root, "scripts"), path.join(root, "README.md"),
  ...process.argv.slice(2).map((dir) => path.resolve(dir))];
const exts = new Set([".mjs", ".sh", ".json", ".txt", ".md", ".ts", ".tsx", ".html", ".xml", ".rsc", ".body", ".js"]);
let bad = 0;
let scanned = 0;

// Files that define the rules themselves (generic family-role words in the blocklist / prompt).
const RULE_FILES = new Set(["scripts/lib/anonymity.mjs", "scripts/sync-notes.mjs"].map((file) => path.join(root, file)));

function scan(full) {
  if (RULE_FILES.has(full)) return;
  scanned += 1;
  const hits = findViolations(fs.readFileSync(full, "utf8"));
  if (hits.length) {
    bad += 1;
    console.log(`${path.relative(root, full)}: ${hits.map((hit) => hit.pattern).join(", ")}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  if (fs.statSync(dir).isFile()) return scan(dir);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "cache") continue;
      walk(full);
    } else if (exts.has(path.extname(entry.name))) {
      scan(full);
    }
  }
}

dirs.forEach(walk);
console.log(bad ? `FAIL: ${bad} file(s) with banned personal info (scanned ${scanned})` : `OK: no banned personal info in ${scanned} files`);
process.exit(bad ? 1 : 0);
