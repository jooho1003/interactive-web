import { readFile, stat } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { storySchema, themeSchema } from "../src/schema";

const root = resolve(import.meta.dirname, "../public");
const [story, theme] = await Promise.all([
  readFile(resolve(root, "story.json"), "utf8").then((text) => storySchema.parse(JSON.parse(text))),
  readFile(resolve(root, "theme.json"), "utf8").then((text) => themeSchema.parse(JSON.parse(text))),
]);
const assets = new Set([theme.audio.bgm.src, theme.audio.sfx.hover, theme.audio.sfx.click]);
for (const node of story.nodes.filter((item) => item.available)) {
  assets.add(node.media.src);
  if (node.media.kind === "video" && node.media.poster) assets.add(node.media.poster);
}
const errors: string[] = [];
for (const src of assets) {
  if (!src.startsWith("/") || src.startsWith("//") || src.includes("\\") || /[?#]/.test(src)) {
    errors.push(`${src}: expected a local public asset path`);
    continue;
  }
  const target = resolve(root, src.slice(1));
  const rel = relative(root, target);
  if (rel.startsWith("..") || isAbsolute(rel)) { errors.push(`${src}: outside public directory`); continue; }
  try {
    const info = await stat(target);
    if (!info.isFile() || info.size === 0) errors.push(`${src}: empty or not a file`);
  } catch { errors.push(`${src}: missing asset`); }
}
if (errors.length) { errors.forEach((message) => console.error(message)); process.exitCode = 1; }
else console.log(`Theme and assets valid: ${assets.size} referenced files.`);
