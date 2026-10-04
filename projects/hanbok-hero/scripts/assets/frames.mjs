// Usage: node frames.mjs <video.mp4> <outdir> [fps]
// Extracts frames at fps (default 4) into outdir/f-%03d.png and writes a numbered contact sheet outdir/contact.png (8 columns).
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
const [video, outdir, fpsArg] = process.argv.slice(2); const fps = Number(fpsArg || 4);
mkdirSync(outdir, { recursive: true });
const probe = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate -of csv=p=0 "${video}"`).toString().trim();
console.log('probe', probe);
execSync(`ffmpeg -y -v error -i "${video}" -vf "fps=${fps}" "${outdir}/f-%03d.png"`);
const frames = readdirSync(outdir).filter(f => /^f-\d+\.png$/.test(f)).sort();
console.log('frames', frames.length);
// contact sheet: scale each to 160px, tile 8 columns, draw index number
const cols = 8, rows = Math.ceil(frames.length / cols);
execSync(`ffmpeg -y -v error -framerate 1 -i "${outdir}/f-%03d.png" -vf "scale=160:-1,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='%{frame_num}':start_number=1:x=4:y=4:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.5,tile=${cols}x${rows}" -frames:v 1 "${outdir}/contact.png"`);
console.log('contact', `${outdir}/contact.png`);
