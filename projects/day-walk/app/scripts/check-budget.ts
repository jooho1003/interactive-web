import { readdir, readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "../dist");
const files = (await readdir(root, { recursive: true })).map((name) => resolve(root, name));
let js = 0, css = 0, assets = 0;
for (const file of files) {
  if (!(await stat(file)).isFile()) continue;
  const ext = extname(file).toLowerCase();
  if (ext === ".js") js += gzipSync(await readFile(file)).length;
  else if (ext === ".css") css += gzipSync(await readFile(file)).length;
  else if (![".html", ".map"].includes(ext) && !(ext === ".svg" && file.endsWith("favicon.svg"))) assets++;
}
const checks = [["JS gzip", js, 120 * 1024], ["CSS gzip", css, 15 * 1024], ["Image/font/audio files", assets, 0]] as const;
for (const [label, actual, limit] of checks) {
  console.log(`${actual <= limit ? "PASS" : "FAIL"} ${label}: ${actual} / ${limit}`);
  if (actual > limit) process.exitCode = 1;
}
