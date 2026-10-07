// Strict anonymity guard for everything published on this site.
// Personal names, family roles and personal details from the source notes must never
// reach slides, captions, post.json or pages. The generator asks the model to write
// neutral copy, then this list is enforced as a hard gate (nothing is written on a hit).

import fs from "node:fs";

// Private list of names/pseudonyms to block, kept OUTSIDE the repo:
//   { "banned": ["regex", ...], "scrub": [["regex", "replacement"], ...] }
export const PRIVATE_TERMS_PATH = process.env.LCAR_PRIVATE_TERMS || "/home/box/agent-data/lcar-private-terms.json";

function loadPrivateTerms() {
  try {
    const data = JSON.parse(fs.readFileSync(PRIVATE_TERMS_PATH, "utf8"));
    return {
      found: true,
      banned: (data.banned || []).map((source) => new RegExp(source, "iu")),
      scrub: (data.scrub || []).map(([source, replacement]) => [new RegExp(source, "giu"), replacement]),
    };
  } catch {
    return { found: false, banned: [], scrub: [] };
  }
}

export const PRIVATE = loadPrivateTerms();

export function requirePrivateTerms() {
  if (!PRIVATE.found && !process.env.LCAR_ALLOW_NO_PRIVATE_TERMS) {
    throw new Error(`Private anonymity terms file not found (${PRIVATE_TERMS_PATH}). Refusing to run.`);
  }
}

// Whole-word match that also works for accented Latin and Cyrillic (JS \b is ASCII-only).
const word = (source) => new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, "iu");

export const BANNED_PATTERNS = [
  // Personal names (and pseudonyms used in the notes) are NOT stored in this public repo.
  // They are loaded from a private terms file on the box — see loadPrivateTerms().
  ...PRIVATE.banned,
  // family roles / relationships
  /아들/u, /아빠/u, /엄마/u, /파파/u, /(?<![가-힣])아내|(?:내|제|우리)\s?아내/u, // "알아내다·찾아내다" 같은 동사는 통과 /남편/u, /우리\s?아이/u, /아이한테/u, /아이에게/u,
  word("pap[aá]"), word("mam[aá]"), word("hij[oa]s?"), word("my (?:son|daughter|kid|wife|husband)"),
  word("daddy"), word("mommy"), word("buddy"), word("figli[oa]"),
  word("maman"), word("père"), word("mère"), word("fils"), word("fille"),
  /сынок/iu, word("сын[а-я]*"), word("папа"), word("мама"), word("доч[а-я]*"),
  /パパ/u, /ママ/u, /息子/u,
  // age / location style personal details
  /\d+\s?(?:살|세)(?![가-힣])/u, /\d+\s?years? old/iu,
];

export function findViolations(text) {
  const hits = [];
  const value = String(text ?? "");
  for (const pattern of BANNED_PATTERNS) {
    const match = value.match(pattern);
    if (match) hits.push({ pattern: String(pattern), match: match[0] });
  }
  return hits;
}

export function assertAnonymous(label, value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const hits = findViolations(text);
  if (hits.length) {
    const detail = hits.map((hit) => hit.pattern).join(", ");
    throw new Error(`Anonymity check failed for ${label}: ${detail}`);
  }
}

// Pre-scrub applied to source notes BEFORE they reach the model, so names and family
// roles never enter the draft in the first place. Replacements are neutral words.
const SCRUB = [
  ...PRIVATE.scrub,
  [/아들아|아들/gu, "친구"], [/아빠|엄마|파파/gu, ""], [/우리\s?아이|아이한테|아이에게/gu, "상대에게"],
  [word("pap[aá]").source, "amigo"], [word("mam[aá]").source, "amiga"], [word("hij[oa]").source, "amigo"],
  [word("buddy").source, "friend"], [word("daddy|mommy").source, "friend"],
  [/\s*Я\s+(?:папа|мама)\.?/giu, ""], [/\s*I'?m (?:a )?(?:dad|mom)\.?/giu, ""],
  [/сынок/giu, "друг"], [word("папа|мама").source, ""], [/パパ|ママ/gu, ""], [/息子/gu, "友だち"],
  [word("maman").source, "ami"], [word("père|mère").source, ""], [word("fils|fille").source, "ami"],
];

export function scrubText(text) {
  let value = String(text ?? "");
  for (const [pattern, replacement] of SCRUB) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, "giu");
    value = value.replace(regex, replacement);
  }
  return value.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.!?])/g, "$1");
}
