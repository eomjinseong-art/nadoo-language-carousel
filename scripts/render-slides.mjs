// Re-renders slides from each carousel's saved spec.json with the current design
// (no API calls, content unchanged). Usage: node scripts/render-slides.mjs [slug ...]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { assertAnonymous, requirePrivateTerms } from "./lib/anonymity.mjs";
import { renderSlides } from "./lib/slides.mjs";

requirePrivateTerms();
const root = path.join(process.cwd(), "content/carousels");
const wanted = process.argv.slice(2);
for (const slug of fs.readdirSync(root)) {
  if (wanted.length && !wanted.includes(slug)) continue;
  const dir = path.join(root, slug);
  const specPath = path.join(dir, "spec.json");
  if (!fs.existsSync(specPath)) continue;
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  assertAnonymous(`${slug}/spec`, spec);
  for (const file of fs.readdirSync(dir)) if (/^slide-\d+\.(png|webp)$/.test(file)) fs.rmSync(path.join(dir, file));
  const files = renderSlides(spec, dir);
  for (const file of files) {
    const png = path.join(dir, file);
    await sharp(png).resize({ width: 1080, withoutEnlargement: true }).webp({ quality: 82 }).toFile(png.replace(/\.png$/, ".webp"));
  }
  console.log(`re-rendered ${slug} (${files.length} slides)`);
}
