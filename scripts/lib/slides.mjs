// Renders 1080x1350 carousel slides in the bright 나두랭귀지 style: light backgrounds,
// a per-language accent (en blue, ja sakura pink, es orange, it green, ru violet — same
// palette as the language-study site), soft gradients + dot pattern, dark readable text.
// Rendered with headless Chrome screenshots of generated HTML.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const THEMES = {
  en: { accent: "#3b82f6", strong: "#1d4ed8", soft: "#e8f1ff", soft2: "#f3f8ff", flag: "🇺🇸", motif: "Aa" },
  ja: { accent: "#f0507a", strong: "#c81e56", soft: "#ffe8ef", soft2: "#fff4f7", flag: "🇯🇵", motif: "あ" },
  es: { accent: "#f97316", strong: "#c2410c", soft: "#ffeedd", soft2: "#fff7ef", flag: "🇪🇸", motif: "Ñ" },
  it: { accent: "#10b981", strong: "#047857", soft: "#dcf7ec", soft2: "#f0fbf6", flag: "🇮🇹", motif: "Ci" },
  ru: { accent: "#8b5cf6", strong: "#6d28d9", soft: "#efe8ff", soft2: "#f8f4ff", flag: "🇷🇺", motif: "Я" },
};

const css = (t) => `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Pretendard','Noto Sans CJK KR','Noto Sans CJK JP','DejaVu Sans',sans-serif;color:#1c2230;position:relative;padding:150px 90px 160px;
background:
 radial-gradient(circle at 92% 6%, ${t.soft} 0, transparent 34%),
 radial-gradient(circle at 4% 96%, ${t.soft} 0, transparent 36%),
 radial-gradient(${t.accent}1f 2.2px, transparent 2.6px) 0 0/34px 34px,
 linear-gradient(180deg, #ffffff 0%, ${t.soft2} 100%);}
:lang(ja).fl,.fl:lang(ja){font-family:'Noto Sans CJK JP','Pretendard',sans-serif}
.motif{position:absolute;right:-30px;bottom:120px;font-size:420px;font-weight:800;color:${t.accent};opacity:.07;line-height:1;letter-spacing:-10px}
.top{position:absolute;z-index:3;top:64px;left:90px;right:90px;display:flex;justify-content:space-between;align-items:center}
.chip{display:inline-flex;align-items:center;gap:12px;background:#fff;border:2px solid ${t.soft};color:${t.strong};font-size:26px;font-weight:700;padding:12px 24px;border-radius:999px;box-shadow:0 6px 18px ${t.accent}1a}
.pg{font-size:26px;font-weight:700;color:${t.strong};background:${t.soft};padding:10px 20px;border-radius:999px}
.bar{position:absolute;z-index:3;bottom:78px;left:90px;width:260px;height:10px;background:${t.soft};border-radius:5px}
.bar i{display:block;height:100%;background:${t.accent};border-radius:5px}
.brand{position:absolute;z-index:3;bottom:62px;right:90px;font-size:28px;font-weight:800;color:${t.strong};letter-spacing:.5px}
.brand:before{content:'';display:inline-block;width:14px;height:14px;border-radius:4px;background:${t.accent};margin-right:12px;vertical-align:middle;transform:rotate(45deg)}
.center{display:flex;flex-direction:column;justify-content:center;height:100%;position:relative;z-index:1}
.kick{align-self:flex-start;font-size:28px;font-weight:800;color:#fff;background:${t.accent};padding:10px 22px;border-radius:14px;margin-bottom:30px;letter-spacing:1px}
h1{font-size:86px;font-weight:800;line-height:1.2;letter-spacing:-2px;margin-bottom:44px;word-break:keep-all;color:#1c2230}
h1 em{font-style:normal;color:${t.strong};background:linear-gradient(transparent 62%, ${t.soft} 62%)}
.body{font-size:42px;line-height:1.6;font-weight:500;color:#3a4254;word-break:keep-all}
.icon{width:150px;height:150px;border-radius:40px;background:#fff;box-shadow:0 12px 30px ${t.accent}26;display:flex;align-items:center;justify-content:center;font-size:84px;margin-bottom:40px}
.tip{margin-top:44px;background:#fff;border-radius:24px;padding:26px 32px;font-size:32px;line-height:1.55;color:#3a4254;box-shadow:0 8px 24px ${t.accent}14;border-left:10px solid ${t.accent};word-break:keep-all}
.tip b{color:${t.strong}}
.card{background:#fff;border-radius:32px;padding:40px 44px;box-shadow:0 14px 40px ${t.accent}1f}
.row{display:flex;gap:26px;align-items:center;margin-bottom:26px}.row:last-child{margin-bottom:0}
.num{flex:none;width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:800}
.n1{background:${t.accent};color:#fff}.n2{background:${t.soft};color:${t.strong}}
.rt{font-size:40px;font-weight:700;line-height:1.35;word-break:keep-all;color:#1c2230}
.sec{font-size:30px;font-weight:800;color:${t.strong};margin-bottom:26px;letter-spacing:1px}
.ex{background:#fff;border-radius:30px;padding:34px 40px;margin-bottom:28px;box-shadow:0 12px 34px ${t.accent}1f;border-top:10px solid ${t.accent}}
.ex:last-child{margin-bottom:0}
.ex .term{font-size:56px;font-weight:800;color:${t.strong};line-height:1.25;letter-spacing:-1px;word-break:keep-all}
.ex .rd{font-size:28px;color:#6b7385;font-weight:500;margin-top:8px}
.ex .mn{display:inline-block;font-size:38px;font-weight:700;color:#1c2230;margin-top:16px;line-height:1.35;background:${t.soft};padding:6px 16px;border-radius:12px;word-break:keep-all}
.ex .eg{font-size:34px;color:#1c2230;margin-top:22px;line-height:1.45;padding-top:20px;border-top:2px dashed ${t.soft}}
.ex .egk{font-size:30px;color:#5b6475;margin-top:6px;line-height:1.45;word-break:keep-all}
.fix{background:#fff;border-radius:28px;padding:30px 36px;margin-bottom:28px;box-shadow:0 10px 30px ${t.accent}1a}
.fix:last-child{margin-bottom:0}
.fix .bf{font-size:32px;color:#8a92a3;line-height:1.4}
.fix .bf:before{content:'✗ ';color:#e5484d;font-weight:800}
.fix .bf span{text-decoration:line-through;text-decoration-color:#e5484d99}
.fix .af{font-size:40px;color:${t.strong};font-weight:800;margin-top:10px;line-height:1.35}
.fix .af:before{content:'✓ ';color:${t.accent}}
.fix .tp{font-size:28px;color:#5b6475;margin-top:12px;line-height:1.45;word-break:keep-all}
/* cover */
.cover{padding:0}
.cover .hero{position:absolute;left:0;right:0;top:0;height:560px;background:linear-gradient(135deg, ${t.accent} 0%, ${t.strong} 100%);overflow:hidden}
.cover .hero:after{content:'';position:absolute;inset:0;background:radial-gradient(rgba(255,255,255,.18) 2.4px, transparent 2.8px) 0 0/34px 34px}
.cover .hero .big{position:absolute;left:90px;top:170px;font-size:150px;font-weight:800;color:#fff;letter-spacing:-3px;line-height:1;z-index:1}
.cover .hero .sub{position:absolute;left:94px;top:350px;font-size:34px;font-weight:700;color:#ffffffd9;z-index:1}
.cover .hero .flag{position:absolute;right:90px;top:160px;font-size:130px;z-index:1;filter:drop-shadow(0 10px 20px rgba(0,0,0,.18))}
.cover .hero .ghost{position:absolute;right:-20px;bottom:-90px;font-size:360px;font-weight:800;color:#ffffff22;line-height:1}
.cover .top .chip{background:#ffffff26;border-color:#ffffff55;color:#fff;box-shadow:none}
.cover .top .pg{background:#ffffff26;color:#fff}
.cover .sheet{position:absolute;left:60px;right:60px;top:470px;bottom:130px;background:#fff;border-radius:40px;box-shadow:0 24px 60px ${t.accent}2e;padding:60px 60px 50px;display:flex;flex-direction:column;justify-content:center}
.cover h1{font-size:84px;margin-bottom:26px}
.cover .body{font-size:38px}
.stats{display:flex;gap:22px;margin-top:40px}
.stat{flex:1;background:${t.soft2};border:2px solid ${t.soft};border-radius:24px;padding:24px 28px}
.stat b{display:block;font-size:46px;font-weight:800;color:${t.strong}}
.stat span{font-size:26px;color:#5b6475;font-weight:600}
.motto{margin-top:34px;font-size:28px;color:#5b6475;font-weight:600}
.motto b{color:${t.strong}}
/* ending */
.end .banner{margin-top:40px;background:linear-gradient(135deg, ${t.accent}, ${t.strong});color:#fff;border-radius:30px;padding:34px 40px;font-size:34px;font-weight:700;line-height:1.5}
.end .banner small{display:block;font-size:28px;font-weight:600;opacity:.85}
.stamp{align-self:flex-start;display:flex;align-items:center;gap:18px;margin-bottom:30px}
.stamp i{font-style:normal;width:120px;height:120px;border-radius:50%;border:6px dashed ${t.accent};display:flex;align-items:center;justify-content:center;font-size:64px;background:#fff;transform:rotate(-8deg)}
`;

// Shrinks the main block until nothing overflows its frame.
const FIT_SCRIPT = `<script>(function(){var m=document.querySelector('.fitbox');if(!m)return;
var f=document.createElement('div');while(m.firstChild)f.appendChild(m.firstChild);m.appendChild(f);f.style.display='flex';f.style.flexDirection='column';
var z=1;while(f.getBoundingClientRect().height>m.clientHeight-4&&z>0.5){z-=0.02;f.style.zoom=z;}})();</script>`;

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const lines = (list) => (Array.isArray(list) ? list : String(list || "").split("\n")).map(esc).join("<br>");

function page(spec, t, index, total, inner, extraClass = "") {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${css(t)}</style></head><body class="${extraClass}">
${extraClass ? "" : `<div class="motif fl" lang="${spec.language}">${esc(t.motif)}</div>`}
<div class="top"><span class="chip">${esc(spec.langLabel)} · ${esc(spec.topLabel || "오늘의 표현")}</span><span class="pg">${index}/${total}</span></div>
${inner}
<div class="bar"><i style="width:${((index / total) * 100).toFixed(1)}%"></i></div>
<div class="brand">나두랭귀지</div>${FIT_SCRIPT}</body></html>`;
}

function exCard(item, lang, big) {
  const size = big ? ' style="font-size:66px"' : "";
  return `<div class="ex"><div class="term fl" lang="${lang}"${size}>${esc(item.term)}</div>
${item.reading ? `<div class="rd fl" lang="${lang}">${esc(item.reading)}</div>` : ""}
<div><span class="mn">${esc(item.meaning)}</span></div>
${item.example ? `<div class="eg fl" lang="${lang}">${esc(item.example)}</div>` : ""}
${item.example_ko ? `<div class="egk">${esc(item.example_ko)}</div>` : ""}</div>`;
}

const numbered = (list, lang) =>
  list
    .map((text, k) => `<div class="row"><div class="num ${k % 2 ? "n2" : "n1"}">${k + 1}</div><div class="rt fl" lang="${lang}">${esc(text)}</div></div>`)
    .join("");

export function buildSlides(spec) {
  const lang = spec.language;
  const t = THEMES[lang] || THEMES.en;
  const groups = spec.expressions;
  const total = 5 + groups.length;
  const out = [];

  out.push([
    `<div class="hero"><div class="big fl" lang="${lang}">${esc(spec.langLabel)}</div><div class="sub">${esc(spec.cover.kicker)}</div><div class="flag">${t.flag}</div><div class="ghost fl" lang="${lang}">${esc(t.motif)}</div></div>
<div class="sheet"><div class="fitbox" style="height:100%;display:flex;flex-direction:column;justify-content:center">
<h1>${esc(spec.cover.line1)}<br><em>${esc(spec.cover.line2)}</em></h1>
<div class="body">${lines(spec.cover.sub)}</div>
<div class="stats">${spec.cover.stats.map((stat) => `<div class="stat"><b>${esc(stat.b)}</b><span>${esc(stat.span)}</span></div>`).join("")}</div>
<div class="motto"><b>나두</b> · 나의 모든 일상을 AI와 함께</div></div></div>`,
    "cover",
  ]);

  out.push([`<div class="center fitbox"><div class="icon">${esc(spec.hook.icon)}</div>
<h1>${esc(spec.hook.line1)}<br><em>${esc(spec.hook.line2)}</em></h1>
<div class="body">${lines(spec.hook.body)}</div>
${spec.hook.note ? `<div class="tip"><b>${esc(spec.hook.note_label || "오늘의 포인트")}</b> ${esc(spec.hook.note)}</div>` : ""}</div>`]);

  groups.forEach((group, gi) => {
    out.push([`<div class="center fitbox"><div class="kick">오늘의 표현 ${gi + 1} / ${groups.length}</div>
${group.map((item) => exCard(item, lang, group.length === 1)).join("")}</div>`]);
  });

  out.push([`<div class="center fitbox"><div class="kick">${esc(spec.fixTitle1 || "교정")} ${esc(spec.fixTitle2 || "노트")}</div>
<h1 style="font-size:72px;margin-bottom:36px">이렇게 <em>고쳐요</em></h1>
${spec.corrections
    .map(
      (fix) => `<div class="fix"><div class="bf fl" lang="${lang}"><span>${esc(fix.before)}</span></div><div class="af fl" lang="${lang}">${esc(fix.after)}</div>${
        fix.tip ? `<div class="tp">${esc(fix.tip)}</div>` : ""
      }</div>`,
    )
    .join("")}</div>`]);

  out.push([`<div class="center fitbox"><h1><em>3줄</em> 요약</h1>
<div class="card">${numbered(spec.summary3, "ko")}</div></div>`]);

  out.push([
    `<div class="center fitbox"><div class="stamp"><i>🔖</i></div>
<h1 style="margin-bottom:34px"><em>저장</em>해 두고 복습!</h1>
<div class="card"><div class="sec">다음 복습 리스트</div>${numbered(spec.review, lang)}</div>
<div class="banner"><small>나두 · 나의 모든 일상을 AI와 함께</small>내일도 AI 튜터와 한 걸음 더 🌱</div></div>`,
    "end",
  ]);

  return out.map(([inner, cls], i) => page(spec, t, i + 1, total, inner, cls || ""));
}

export function renderSlides(spec, outDir) {
  const chrome = process.env.CHROME_BIN || "google-chrome";
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lcar-"));
  const pages = buildSlides(spec);
  const files = [];
  pages.forEach((html, i) => {
    const htmlPath = path.join(tmp, `s${i + 1}.html`);
    fs.writeFileSync(htmlPath, html, "utf8");
    const file = `slide-${String(i + 1).padStart(2, "0")}.png`;
    execFileSync(
      chrome,
      [
        "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1", "--window-size=1080,1350", "--virtual-time-budget=2000",
        `--screenshot=${path.join(outDir, file)}`, `file://${htmlPath}`,
      ],
      { stdio: "ignore" },
    );
    files.push(file);
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  return files;
}
