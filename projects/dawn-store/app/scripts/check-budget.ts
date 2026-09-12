import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "../dist");
const files = (await readdir(root, { recursive: true })).map((name) => resolve(root, name));
let js = 0, css = 0, images = 0, largestImage = 0, fonts = 0;
for (const file of files) {
  if (!(await stat(file)).isFile()) continue;
  const ext = extname(file).toLowerCase();
  if ([".js", ".css"].includes(ext)) {
    const size = gzipSync(await readFile(file)).length;
    if (ext === ".js") js += size; else css += size;
  } else if ([".webp", ".png", ".jpg", ".jpeg", ".avif", ".gif"].includes(ext)) {
    const size = (await stat(file)).size;
    images += size;
    largestImage = Math.max(largestImage, size);
  } else if ([".woff", ".woff2", ".ttf", ".otf"].includes(ext)) fonts++;
}
const checks = [
  ["JS gzip (all chunks)", js, 150 * 1024], ["CSS gzip", css, 20 * 1024],
  ["Total images", images, 3 * 1024 * 1024], ["Largest image", largestImage, 400 * 1024], ["Font files", fonts, 6],
] as const;
for (const [label, actual, limit] of checks) {
  console.log(`${actual <= limit ? "PASS" : "FAIL"} ${label}: ${actual} / ${limit}`);
  if (actual > limit) process.exitCode = 1;
}
