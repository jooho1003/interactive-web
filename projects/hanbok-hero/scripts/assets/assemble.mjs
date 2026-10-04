// Usage: node assemble.mjs <out.png> <cell> <cols> <rows> <png1> <png2> ... (row-major, cols*rows files, each RGBA)
// Scales each input to cell x cell (pad transparent, keep aspect) and tiles with xstack keeping alpha.
import { execSync } from 'node:child_process';
const [out, cellArg, colsArg, rowsArg, ...files] = process.argv.slice(2);
const cell = Number(cellArg), cols = Number(colsArg), rows = Number(rowsArg);
if (files.length !== cols * rows) throw new Error(`need ${cols * rows} files, got ${files.length}`);
const inputs = files.map(f => `-i "${f}"`).join(' ');
const scaled = files.map((_, i) => `[${i}:v]format=rgba,scale=${cell - 8}:${cell - 8}:force_original_aspect_ratio=decrease,pad=${cell}:${cell}:(ow-iw)/2:(oh-ih)/2:color=0x00000000[s${i}]`).join(';');
const layout = files.map((_, i) => `${(i % cols) * cell}_${Math.floor(i / cols) * cell}`).join('|');
const refs = files.map((_, i) => `[s${i}]`).join('');
const cmd = `ffmpeg -y -v error ${inputs} -filter_complex "${scaled};${refs}xstack=inputs=${files.length}:layout=${layout}:fill=0x00000000[o]" -map "[o]" -pix_fmt rgba "${out}"`;
execSync(cmd, { stdio: 'inherit' });
console.log('wrote', out, `${cell * cols}x${cell * rows}`);
