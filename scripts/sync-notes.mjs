// Creates one carousel per language-study note that does not have a carousel yet.
//
//   node scripts/sync-notes.mjs                 # all languages, only new notes (idempotent)
//   node scripts/sync-notes.mjs --lang=en,ja    # limit languages
//   node scripts/sync-notes.mjs --date=2026-09-30
//   node scripts/sync-notes.mjs --refresh       # also rebuild carousels whose note was updated later
//   node scripts/sync-notes.mjs --force --lang=ja --date=2026-09-30   # rebuild an existing one
//   node scripts/sync-notes.mjs --dry-run       # list what would be created
//
// Secrets come from env (LANGSTUDY_API_KEY, LANGSTUDY_BASE_URL, LCAR_OPENAI_API_KEY / OPENAI_API_KEY) or, on the box,
// from /home/box/agent-data/box-secrets.json. They are never printed.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { assertAnonymous, findViolations, requirePrivateTerms, scrubText } from "./lib/anonymity.mjs";
import { renderSlides } from "./lib/slides.mjs";

const LANGS = {
  en: { label: "English", ko: "영어", bot: "영어봇" },
  ja: { label: "日本語", ko: "일본어", bot: "일본어봇" },
  es: { label: "Español", ko: "스페인어", bot: "스페인어봇" },
  it: { label: "Italiano", ko: "이탈리아어", bot: "이탈리아어봇" },
  ru: { label: "Русский", ko: "러시아어", bot: "러시아어봇" },
};

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? true];
  }),
);
const root = process.cwd();
const contentRoot = path.join(root, "content/carousels");
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4";

function secrets() {
  let file = {};
  const secretPath = process.env.BOX_SECRETS || "/home/box/agent-data/box-secrets.json";
  try {
    file = JSON.parse(fs.readFileSync(secretPath, "utf8"));
  } catch {
    file = {};
  }
  return {
    base: (process.env.LANGSTUDY_BASE_URL || file.langstudy?.BASE_URL || "https://language-study-snowy.vercel.app").replace(/\/$/, ""),
    apiKey: process.env.LANGSTUDY_API_KEY || file.langstudy?.API_KEY || "",
    openai:
      process.env.LCAR_OPENAI_API_KEY ||
      file.card?.OPENAI_API_KEY_FIXED ||
      (/^sk-/.test(process.env.OPENAI_API_KEY || "") ? process.env.OPENAI_API_KEY : "") ||
      "",
  };
}

async function api(sec, pathname) {
  const response = await fetch(`${sec.base}${pathname}`, { headers: { Authorization: `Bearer ${sec.apiKey}` } });
  if (!response.ok) throw new Error(`GET ${pathname} -> ${response.status}`);
  return response.json();
}

function existingPosts() {
  const map = new Map();
  if (!fs.existsSync(contentRoot)) return map;
  for (const folder of fs.readdirSync(contentRoot)) {
    const file = path.join(contentRoot, folder, "post.json");
    if (!fs.existsSync(file)) continue;
    try {
      const post = JSON.parse(fs.readFileSync(file, "utf8"));
      if (post.note_id) map.set(post.note_id, { folder, post });
    } catch {
      /* ignore */
    }
  }
  return map;
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["slug_hint", "title", "summary", "tags", "cover", "hook", "expressions", "fix_title", "corrections", "summary3", "review", "caption_hook", "caption_question"],
  properties: {
    slug_hint: { type: "string", description: "2-4 lowercase ascii words joined by hyphens, e.g. idioms-warmup" },
    title: { type: "string", description: "Korean page title, <= 32 chars, catchy, mentions the language" },
    summary: { type: "string", description: "Korean 1-2 sentence meta description, <= 110 chars" },
    tags: { type: "array", items: { type: "string" }, description: "exactly 4 Korean/English hashtag words without #" },
    cover: {
      type: "object", additionalProperties: false, required: ["line1", "line2", "sub"],
      properties: {
        line1: { type: "string", description: "<= 8 chars Korean, white first headline line" },
        line2: { type: "string", description: "<= 9 chars Korean, highlighted second line" },
        sub: { type: "array", items: { type: "string" }, description: "exactly 3 short Korean lines (<= 20 chars each)" },
      },
    },
    hook: {
      type: "object", additionalProperties: false, required: ["icon", "line1", "line2", "body", "note"],
      properties: {
        icon: { type: "string", description: "one emoji" },
        line1: { type: "string", description: "<= 8 chars" },
        line2: { type: "string", description: "<= 8 chars, highlighted" },
        body: { type: "array", items: { type: "string" }, description: "exactly 3 Korean lines <= 22 chars: what today's lesson covered" },
        note: { type: "string", description: "one-line tip <= 40 chars" },
      },
    },
    expressions: {
      type: "array",
      description: "exactly 4 slides (groups). Each group has 1 or 2 expressions. Use the most useful 4-8 expressions.",
      items: {
        type: "array",
        items: {
          type: "object", additionalProperties: false, required: ["term", "reading", "meaning", "example", "example_ko"],
          properties: {
            term: { type: "string", description: "target-language expression, <= 40 chars" },
            reading: { type: "string", description: "romanization/Korean reading, or empty for English" },
            meaning: { type: "string", description: "Korean meaning <= 24 chars" },
            example: { type: "string", description: "neutral target-language example sentence <= 60 chars" },
            example_ko: { type: "string", description: "Korean translation <= 40 chars" },
          },
        },
      },
    },
    fix_title: { type: "array", items: { type: "string" }, description: "2 short Korean words, e.g. ['교정','노트'] or ['헷갈림','주의']" },
    corrections: {
      type: "array", description: "2-3 items: learner's mistake -> corrected form, from the correction lines or common confusions",
      items: {
        type: "object", additionalProperties: false, required: ["before", "after", "tip"],
        properties: {
          before: { type: "string", description: "mistaken form <= 45 chars" },
          after: { type: "string", description: "correct form <= 45 chars" },
          tip: { type: "string", description: "Korean tip <= 38 chars" },
        },
      },
    },
    summary3: { type: "array", items: { type: "string" }, description: "exactly 3 Korean summary lines <= 20 chars" },
    review: { type: "array", items: { type: "string" }, description: "2-4 short review items (target language + short Korean hint), <= 30 chars" },
    caption_hook: { type: "string", description: "2-3 Korean sentences for the caption intro" },
    caption_question: { type: "string", description: "one Korean question inviting comments" },
  },
};

const SYSTEM = `당신은 '나두랭귀지 캐러셀'의 에디터입니다. '나두'는 '나의 모든 일상을 AI와 함께'라는 뜻이고,
이 사이트는 AI 튜터와 매일 외국어를 공부한 노트를 인스타 카드뉴스(9장)로 바꿉니다. 한국어 학습자 대상, 친근하고 짧게.

엄격한 익명성 규칙 (가장 중요):
- 사람 이름을 절대 쓰지 마세요 (노트에 나온 이름·호칭·가명 포함: 예문의 호격 이름은 모두 삭제하거나 'friend/amigo/друг' 같은 일반어로).
- 가족 관계(아들, 딸, 아빠, 엄마, 아이, 남편, 아내, hijo, papá, сынок, папа, パパ, 息子, buddy 등), 나이, 사는 곳, 직업 등 개인 정보를 쓰지 마세요.
- '아들에게 하는 인사' 같은 제목은 '하루 인사 표현'처럼 중립적으로 바꾸세요. 예문도 누구에게나 쓸 수 있는 일반 문장으로 바꾸세요.
- 교정(before/after)에서도 학습자가 쓴 원문의 이름·호칭은 지우거나 일반어로 바꿔서 옮기세요 (예: 'ciao <이름>' → 'ciao amico').
- 학습자는 '학습자' 또는 주어 생략으로 표현하세요. 자기소개 예문은 이름 자리를 '〜'로 두세요 (예: 私は〜です).
- 예문은 문법·존댓말이 자연스럽게 맞도록 쓰세요 (예: 존댓말 인사에 친구 호칭 붙이지 않기).

내용 규칙:
- 노트의 key_expressions, 교정(correction) 대화, summary, review_next, 같은 날 추가된 카드를 바탕으로 사실만 쓰세요. 뜻과 철자는 정확하게.
- 교정이 없는 노트면 헷갈리기 쉬운 포인트(발음·철자·비슷한 단어)를 before→after로 정리하세요.
- 글자 수 제한을 반드시 지키세요. 이모지는 hook.icon에만.`;

async function draftSpec(sec, lang, note, cards, feedback = "") {
  const payload = {
    language: lang,
    language_name: LANGS[lang].ko,
    note: {
      title: note.title,
      summary: note.summary,
      key_expressions: note.key_expressions,
      corrections: (note.dialogue || []).filter((turn) => turn.role === "correction").map((turn) => turn.text),
      dialogue: note.dialogue,
      review_next: note.review_next,
    },
    same_day_cards: cards.map((card) => ({ term: card.term, meaning_ko: card.meaning_ko, example: card.example, example_ko: card.example_ko, reading: card.reading })),
  };
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${sec.openai}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `다음 학습 노트로 캐러셀 JSON을 만드세요.${feedback}\n\n${scrubText(JSON.stringify(payload))}` },
      ],
      response_format: { type: "json_schema", json_schema: { name: "carousel", strict: true, schema: SCHEMA } },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

function kstIso(note) {
  const stamp = note.updated_at || note.added_at;
  const date = stamp ? new Date(stamp) : new Date(`${note.date}T21:00:00+09:00`);
  const kst = new Date(date.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 19);
  return `${kst}+09:00`;
}

function slideText(spec, raw) {
  const list = [];
  list.push([`${raw.cover.line1} ${raw.cover.line2}`, ...raw.cover.sub].join("\n"));
  list.push([`${raw.hook.line1} ${raw.hook.line2}`, ...raw.hook.body, raw.hook.note].join("\n"));
  raw.expressions.forEach((group, i) => {
    const body = group.map((item) =>
      [`${item.term}${item.reading ? ` (${item.reading})` : ""} — ${item.meaning}`, item.example ? `예: ${item.example} → ${item.example_ko}` : ""].filter(Boolean).join("\n"),
    );
    list.push([`오늘의 표현 ${i + 1}`, ...body].join("\n"));
  });
  list.push([raw.fix_title.join(" "), ...raw.corrections.map((fix) => `${fix.before} → ${fix.after}${fix.tip ? ` (${fix.tip})` : ""}`)].join("\n"));
  list.push(["3줄 요약", ...raw.summary3].join("\n"));
  list.push(["저장해 두고 복습!", ...raw.review.map((item) => `· ${item}`), "나두 · 나의 모든 일상을 AI와 함께. 내일도 AI 튜터와 한 걸음 더."].join("\n"));
  return list;
}

async function buildCarousel(sec, lang, note, cards, existing) {
  let raw;
  let feedback = "";
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    raw = await draftSpec(sec, lang, note, cards, feedback);
    const hits = findViolations(JSON.stringify(raw));
    if (hits.length && process.env.LCAR_DEBUG) fs.writeFileSync(`/tmp/lcar-rejected-${lang}-${attempt}.json`, JSON.stringify(raw, null, 2));
    if (!hits.length) break;
    feedback = `\n\n이전 초안에 금지된 개인 정보/호칭이 있었습니다 (${hits.map((hit) => hit.match).join(", ")}). 모두 제거하고 중립적으로 다시 쓰세요.`;
    console.warn(`[${lang}] draft ${attempt} rejected by anonymity gate: ${hits.map((hit) => hit.match).join(", ")}`);
    if (attempt === 4) throw new Error(`${note.id}: anonymity violations remain after retries; nothing written`);
  }
  raw.expressions = raw.expressions.filter((group) => group.length).slice(0, 4);
  const info = LANGS[lang];
  const day = note.date.replaceAll("-", "");
  const hint = String(raw.slug_hint || "notes").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "notes";
  const slug = existing?.folder || `${lang}-${hint}-${day}`;
  const exprCount = raw.expressions.flat().length;
  const spec = {
    language: lang,
    langLabel: info.label,
    topLabel: `${info.ko} · ${note.date.slice(5).replace("-", "/")}`,
    cover: {
      kicker: `AI 튜터와 매일 · ${info.ko}`,
      line1: raw.cover.line1,
      line2: raw.cover.line2,
      sub: raw.cover.sub,
      stats: [
        { b: `표현 ${exprCount}개`, span: "오늘 배운 표현" },
        { b: `교정 ${raw.corrections.length}개`, span: "틀리기 쉬운 포인트" },
      ],
    },
    hook: { ...raw.hook, note_label: "오늘의 포인트" },
    expressions: raw.expressions,
    fixTitle1: raw.fix_title[0] || "교정",
    fixTitle2: raw.fix_title[1] || "노트",
    corrections: raw.corrections.slice(0, 3),
    summary3: raw.summary3.slice(0, 3),
    review: raw.review.slice(0, 4),
  };
  const tags = [...raw.tags.slice(0, 4).map((tag) => tag.replace(/^#/, "").replace(/\s+/g, "")), "나두랭귀지"];
  const post = {
    slug,
    language: lang,
    note_id: note.id,
    note_date: note.date,
    note_updated_at: note.updated_at || note.added_at || "",
    date: kstIso(note),
    title: raw.title,
    summary: raw.summary,
    tags,
    slides: slideText(spec, raw).map((text, i) => ({ image: `slide-${String(i + 1).padStart(2, "0")}.png`, text })),
  };
  const caption = `TITLE:\n${raw.title}\n\nBODY:\n${raw.caption_hook}\n\n${raw.summary3.map((line) => `✔ ${line}`).join("\n")}\n\n나두 = 나의 모든 일상을 AI와 함께. 오늘도 AI 튜터와 ${info.ko} 한 걸음.\n\n${raw.caption_question}\n\n${tags.map((tag) => `#${tag}`).join(" ")}\n`;
  const sources = `# 학습 노트 출처\n\n- ${info.ko} 공부 노트 (${note.date}) — AI 튜터 ${info.bot}와의 학습 기록을 익명으로 재구성\n- 표현·예문은 학습 노트와 같은 날 추가된 단어 카드에서 골라 누구나 쓸 수 있는 문장으로 다듬었습니다.\n`;

  for (const [label, value] of [["spec", spec], ["post", post], ["caption", caption], ["sources", sources]]) assertAnonymous(`${slug}/${label}`, value);

  const dir = path.join(contentRoot, slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const file of fs.readdirSync(dir)) if (/^slide-\d+\.(png|webp)$/.test(file)) fs.rmSync(path.join(dir, file));
  const files = renderSlides(spec, dir);
  for (const file of files) {
    const png = path.join(dir, file);
    await sharp(png).resize({ width: 1080, withoutEnlargement: true }).webp({ quality: 80 }).toFile(png.replace(/\.png$/, ".webp"));
  }
  fs.writeFileSync(path.join(dir, "spec.json"), `${JSON.stringify(spec, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, "post.json"), `${JSON.stringify(post, null, 2)}\n`);
  fs.writeFileSync(path.join(dir, "caption.txt"), caption);
  fs.writeFileSync(path.join(dir, "sources.md"), sources);
  return { slug, title: raw.title, slides: files.length };
}

async function main() {
  requirePrivateTerms();
  const sec = secrets();
  if (!sec.apiKey) throw new Error("Missing language-study API key (LANGSTUDY_API_KEY)");
  const langs = args.lang ? String(args.lang).split(",") : Object.keys(LANGS);
  const existing = existingPosts();
  const created = [];
  for (const lang of langs) {
    if (!LANGS[lang]) throw new Error(`Unknown language: ${lang}`);
    const { notes = [] } = await api(sec, `/api/v1/notes?language=${lang}`);
    const todo = notes.filter((note) => {
      if (args.date && note.date !== args.date) return false;
      const have = existing.get(note.id);
      if (!have || args.force) return true;
      const updated = note.updated_at || note.added_at || "";
      return Boolean(args.refresh) && updated > (have.post.note_updated_at || "");
    });
    if (!todo.length) {
      console.log(`[${lang}] up to date (${notes.length} note${notes.length === 1 ? "" : "s"})`);
      continue;
    }
    if (args["dry-run"]) {
      todo.forEach((note) => console.log(`[${lang}] would build ${note.id} (${note.date})`));
      continue;
    }
    if (!sec.openai) throw new Error("Missing OPENAI_API_KEY");
    const { items = [] } = await api(sec, `/api/v1/items?language=${lang}&include=all`);
    for (const note of todo) {
      const cards = items.filter(
        (item) => item.added_by !== "seed" && (String(item.tags || "").includes(note.date) || String(item.added_at || "").startsWith(note.date)),
      );
      const result = await buildCarousel(sec, lang, note, cards, existing.get(note.id));
      created.push(result);
      console.log(`[${lang}] built ${result.slug} — ${result.title} (${result.slides} slides)`);
    }
  }
  if (!args["dry-run"]) console.log(created.length ? `Created/updated ${created.length} carousel(s).` : "No new notes. Nothing to do.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
