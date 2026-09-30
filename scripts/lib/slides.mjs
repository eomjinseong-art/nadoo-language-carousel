// Renders 1080x1350 carousel slides in the same visual style as the 나두Ai carousels
// (dark gradient, cyan/yellow accents, top label, progress bar, brand dot) using
// headless Chrome screenshots of generated HTML.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'Pretendard','Noto Sans CJK KR','Noto Sans CJK JP','DejaVu Sans',sans-serif;color:#F2F4F8;
background:radial-gradient(circle at 85% 8%,rgba(0,229,255,.16),transparent 38%),radial-gradient(circle at 5% 95%,rgba(230,255,0,.10),transparent 40%),linear-gradient(160deg,#0A0E1A 0%,#060912 60%,#03050B 100%);
position:relative;padding:120px 96px 150px}
:lang(ja) .fl{font-family:'Noto Sans CJK JP','Pretendard',sans-serif}
.top{position:absolute;top:64px;left:96px;right:96px;display:flex;justify-content:space-between;font-size:26px;color:#7C8599;font-weight:500;letter-spacing:1px}
.top .repo{color:#00E5FF}
.brand{position:absolute;bottom:60px;right:96px;font-size:26px;font-weight:700;color:#E6FF00;letter-spacing:1px}
.brand:before{content:'';display:inline-block;width:12px;height:12px;border-radius:50%;background:#E6FF00;margin-right:12px;vertical-align:middle}
.bar{position:absolute;bottom:72px;left:96px;width:220px;height:6px;background:#1C2233;border-radius:3px}
.bar i{display:block;height:100%;background:linear-gradient(90deg,#00E5FF,#E6FF00);border-radius:3px}
.num{font-size:30px;font-weight:700;color:#00E5FF;letter-spacing:4px;margin-bottom:28px}
h1{font-size:88px;font-weight:700;line-height:1.2;letter-spacing:-2px;margin-bottom:48px;word-break:keep-all}
h1 em{font-style:normal;color:#E6FF00}
.body{font-size:42px;line-height:1.6;font-weight:500;color:#D5DAE5;letter-spacing:-.5px;word-break:keep-all}
.icon{font-size:112px;margin-bottom:36px;line-height:1}
.card{background:rgba(255,255,255,.04);border:2px solid rgba(0,229,255,.25);border-radius:28px;padding:40px 44px}
.row{display:flex;gap:28px;align-items:center;margin-bottom:26px}
.row:last-child{margin-bottom:0}
.tag{flex:none;width:84px;height:84px;border-radius:24px;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:700;color:#0A0E1A}
.y{background:#E6FF00}.c{background:#00E5FF}
.rt{font-size:40px;font-weight:600;line-height:1.35;word-break:keep-all}
.rt small{display:block;font-size:26px;color:#7C8599;font-weight:500;letter-spacing:1px}
.stats{display:flex;gap:24px;margin-top:60px}
.stat{flex:1;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.08);border-radius:28px;padding:32px 34px}
.stat b{display:block;font-size:52px;font-weight:700;color:#E6FF00;letter-spacing:-1px}
.stat.cy b{color:#00E5FF}
.stat span{font-size:27px;color:#8A93A8;font-weight:500}
.center{display:flex;flex-direction:column;justify-content:center;height:100%}
.hs{align-self:flex-start;font-size:84px;font-weight:700;color:#00E5FF;letter-spacing:-1px;line-height:1.1;padding-bottom:12px;border-bottom:6px solid #00E5FF;margin-bottom:40px}
.note{margin-top:44px;border-left:6px solid #E6FF00;padding:8px 0 8px 28px;font-size:32px;line-height:1.6;color:#AEB6C8;word-break:keep-all}
.note b{color:#E6FF00}
.ex{background:rgba(255,255,255,.04);border:2px solid rgba(0,229,255,.25);border-radius:28px;padding:36px 42px;margin-bottom:28px}
.ex:last-child{margin-bottom:0}
.ex .term{font-size:58px;font-weight:700;color:#00E5FF;line-height:1.25;letter-spacing:-1px;word-break:keep-all}
.ex .rd{font-size:28px;color:#7C8599;font-weight:500;margin-top:8px}
.ex .mn{font-size:40px;font-weight:700;color:#E6FF00;margin-top:18px;line-height:1.35;word-break:keep-all}
.ex .eg{font-size:34px;color:#F2F4F8;margin-top:22px;line-height:1.45;padding-top:22px;border-top:2px dashed rgba(255,255,255,.12)}
.ex .egk{font-size:30px;color:#AEB6C8;margin-top:6px;line-height:1.45;word-break:keep-all}
.fix{margin-bottom:30px;background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.08);border-radius:28px;padding:30px 36px}
.fix:last-child{margin-bottom:0}
.fix .bf{font-size:32px;color:#8A93A8;text-decoration:line-through;text-decoration-color:#FF5F57;line-height:1.4}
.fix .af{font-size:40px;color:#00E5FF;font-weight:700;margin-top:10px;line-height:1.35}
.fix .af:before{content:'→ ';color:#E6FF00}
.fix .tp{font-size:28px;color:#AEB6C8;margin-top:12px;line-height:1.45;word-break:keep-all}
.motto{margin-top:48px;font-size:30px;color:#7C8599;font-weight:600;letter-spacing:1px}
.motto b{color:#E6FF00}
`;

// Shrinks the main block until nothing overflows the slide frame.
const FIT_SCRIPT = `<script>(function(){var m=document.querySelector('.center');if(!m)return;
var f=document.createElement('div');while(m.firstChild)f.appendChild(m.firstChild);m.appendChild(f);f.style.display='flex';f.style.flexDirection='column';
var z=1;while(f.getBoundingClientRect().height>m.clientHeight-4&&z>0.5){z-=0.02;f.style.zoom=z;}})();</script>`;

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const lines = (list) => (Array.isArray(list) ? list : String(list || "").split("\n")).map(esc).join("<br>");

function page(spec, index, total, inner) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="top"><span class="repo">${esc(spec.langLabel)} · ${esc(spec.topLabel || "오늘의 표현")}</span><span>${index}/${total}</span></div>
${inner}
<div class="bar"><i style="width:${((index / total) * 100).toFixed(1)}%"></i></div>
<div class="brand">나두랭귀지</div>${FIT_SCRIPT}</body></html>`;
}

function exCard(item, lang, big) {
  const size = big ? ' style="font-size:66px"' : "";
  return `<div class="ex"><div class="term fl" lang="${lang}"${size}>${esc(item.term)}</div>
${item.reading ? `<div class="rd fl" lang="${lang}">${esc(item.reading)}</div>` : ""}
<div class="mn">${esc(item.meaning)}</div>
${item.example ? `<div class="eg fl" lang="${lang}">${esc(item.example)}</div>` : ""}
${item.example_ko ? `<div class="egk">${esc(item.example_ko)}</div>` : ""}</div>`;
}

export function buildSlides(spec) {
  const lang = spec.language;
  const groups = spec.expressions;
  const total = 5 + groups.length;
  const out = [];

  out.push(`<div class="center">
<div class="num">${esc(spec.cover.kicker)}</div>
<h1 style="font-size:92px;margin-bottom:36px">${esc(spec.cover.line1)}<br><em>${esc(spec.cover.line2)}</em></h1>
<div class="hs fl" lang="${lang}">${esc(spec.langLabel)}</div>
<div class="body" style="font-size:40px">${lines(spec.cover.sub)}</div>
<div class="stats" style="margin-top:48px">${spec.cover.stats
    .map((stat, i) => `<div class="stat${i % 2 ? " cy" : ""}"><b>${esc(stat.b)}</b><span>${esc(stat.span)}</span></div>`)
    .join("")}</div>
<div class="motto"><b>나두</b> · 나의 모든 일상을 AI와 함께</div>
</div>`);

  out.push(`<div class="center"><div class="icon">${esc(spec.hook.icon)}</div>
<h1>${esc(spec.hook.line1)}<br><em>${esc(spec.hook.line2)}</em></h1>
<div class="body">${lines(spec.hook.body)}</div>
${spec.hook.note ? `<div class="note"><b>${esc(spec.hook.note_label || "오늘의 포인트")}</b> ${esc(spec.hook.note)}</div>` : ""}</div>`);

  groups.forEach((group, gi) => {
    out.push(`<div class="center"><div class="num">오늘의 표현 ${gi + 1} / ${groups.length}</div>
${group.map((item) => exCard(item, lang, group.length === 1)).join("")}</div>`);
  });

  out.push(`<div class="center"><h1>${esc(spec.fixTitle1 || "교정")}<br><em>${esc(spec.fixTitle2 || "노트")}</em></h1>
${spec.corrections
    .map(
      (fix) => `<div class="fix"><div class="bf fl" lang="${lang}">${esc(fix.before)}</div><div class="af fl" lang="${lang}">${esc(fix.after)}</div>${
        fix.tip ? `<div class="tp">${esc(fix.tip)}</div>` : ""
      }</div>`,
    )
    .join("")}</div>`);

  out.push(`<div class="center"><h1><em>3줄</em> 요약</h1>
<div class="card">${spec.summary3
    .map((text, k) => `<div class="row"><div class="tag ${"yc"[k % 2]}">${k + 1}</div><div class="rt">${esc(text)}</div></div>`)
    .join("")}</div></div>`);

  out.push(`<div class="center"><div class="icon">🔖</div>
<h1><em>저장</em>해 두고 복습!</h1>
<div class="card"><div style="font-size:26px;color:#7C8599;font-weight:600;margin-bottom:24px">다음 복습 리스트</div>${spec.review
    .map((text, k) => `<div class="row"><div class="tag ${"yc"[k % 2]}">${k + 1}</div><div class="rt fl" lang="${lang}" style="font-size:36px">${esc(text)}</div></div>`)
    .join("")}</div>
<div class="motto" style="font-size:32px;line-height:1.6"><b>나두</b> · 나의 모든 일상을 AI와 함께<br>내일도 AI 튜터와 한 걸음 더 🌱</div></div>`);

  return out.map((inner, i) => page(spec, i + 1, total, inner));
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
