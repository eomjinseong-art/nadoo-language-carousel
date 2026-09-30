import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const contentRoot = path.join(root, "content/carousels");
const publicRoot = path.join(root, "public/carousels");

function webpName(filename) {
  return filename.replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

if (!fs.existsSync(contentRoot)) {
  console.log("No content/carousels directory. Skipping image optimization.");
  process.exit(0);
}

fs.rmSync(publicRoot, { recursive: true, force: true });
fs.mkdirSync(publicRoot, { recursive: true });

const slugs = fs.readdirSync(contentRoot);
let count = 0;

for (const slug of slugs) {
  const dir = path.join(contentRoot, slug);
  const postPath = path.join(dir, "post.json");
  if (!fs.existsSync(postPath) || !fs.statSync(dir).isDirectory()) continue;
  const post = JSON.parse(fs.readFileSync(postPath, "utf8"));
  const slides = Array.isArray(post.slides) ? post.slides : [];
  const dest = path.join(publicRoot, slug);
  fs.mkdirSync(dest, { recursive: true });

  for (const slide of slides) {
    const filename = path.basename(String(slide.image || ""));
    if (!filename) continue;
    const source = path.join(dir, filename);
    const webp = path.join(dir, webpName(filename));
    const sourceFile = fs.existsSync(source) ? source : fs.existsSync(webp) ? webp : "";
    if (!sourceFile) {
      console.error(`Missing slide image: ${source}`);
      process.exit(1);
    }
    await sharp(sourceFile)
      .rotate()
      .resize({ width: 1080, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(dest, webpName(filename)));
    count += 1;
  }
}

console.log(`Optimized ${count} slide image${count === 1 ? "" : "s"} to public/carousels`);
