// fal.ai helper (scratch, not part of the repo). Usage from node: import { run, queue, download } from './fal.mjs'
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
const key = process.env.FAL_KEY; if (!key) throw new Error('FAL_KEY missing');
const H = { Authorization: `Key ${key}`, 'Content-Type': 'application/json' };
export async function run(model, input) {
  const r = await fetch(`https://fal.run/${model}`, { method: 'POST', headers: H, body: JSON.stringify(input) });
  const t = await r.text(); if (!r.ok) throw new Error(`${model} ${r.status}: ${t.slice(0, 600)}`);
  return JSON.parse(t);
}
export async function queue(model, input, { every = 5000, max = 600000 } = {}) {
  const r = await fetch(`https://queue.fal.run/${model}`, { method: 'POST', headers: H, body: JSON.stringify(input) });
  const t = await r.text(); if (!r.ok) throw new Error(`${model} submit ${r.status}: ${t.slice(0, 600)}`);
  const { status_url, response_url } = JSON.parse(t);
  const t0 = Date.now();
  for (;;) {
    const s = await (await fetch(status_url, { headers: H })).json();
    if (s.status === 'COMPLETED') break;
    if (s.status === 'FAILED') throw new Error('queue failed: ' + JSON.stringify(s).slice(0, 600));
    if (Date.now() - t0 > max) throw new Error('queue timeout');
    await new Promise(res => setTimeout(res, every));
  }
  const out = await fetch(response_url, { headers: H }); const ot = await out.text();
  if (!out.ok) throw new Error(`result ${out.status}: ${ot.slice(0, 600)}`);
  return JSON.parse(ot);
}
export async function download(url, path) {
  const r = await fetch(url); if (!r.ok) throw new Error(`download ${r.status} ${url}`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, Buffer.from(await r.arrayBuffer()));
  return path;
}
export async function upload(path, contentType = 'image/png') {
  const { readFile } = await import('node:fs/promises');
  const data = await readFile(path);
  const init = await fetch('https://rest.alpha.fal.ai/storage/upload/initiate', { method: 'POST', headers: H, body: JSON.stringify({ content_type: contentType, file_name: path.split(/[\\/]/).pop() }) });
  const it = await init.text(); if (!init.ok) throw new Error(`upload init ${init.status}: ${it.slice(0, 400)}`);
  const { upload_url, file_url } = JSON.parse(it);
  const put = await fetch(upload_url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: data });
  if (!put.ok) throw new Error(`upload put ${put.status}`);
  return file_url;
}
