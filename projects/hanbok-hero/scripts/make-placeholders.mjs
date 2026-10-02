// 실제 그림이 오기 전까지 쓰는 자리표시 PNG. 의존성 없이 zlib로 쓴다.
import { deflateSync } from 'node:zlib';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function crc32(buf) { let crc = ~0; for (const byte of buf) { crc ^= byte; for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1)); } return ~crc >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
export function png(width, height, pixel) {
  const stride = width * 4 + 1, raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const [r, g, b, a] = pixel(x, y), i = y * stride + 1 + x * 4;
    raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
// 칸 하나: 베이지 원(얼굴) + 눈동자 두 개. look = {col,row} ∈ {-1,0,1}가 눈동자 위치를 옮긴다.
export function cell(size, look) {
  const c = size / 2, face = size * 0.36, eyeY = c - size * 0.05, eyeDX = size * 0.13, pupil = size * 0.035;
  const px = look.col * size * 0.04, py = look.row * size * 0.03;
  return (x, y) => {
    for (const ex of [c - eyeDX, c + eyeDX]) if (Math.hypot(x - ex - px, y - eyeY - py) < pupil) return [40, 30, 30, 255];
    if (Math.hypot(x - c, y - eyeY) < face) return [236, 214, 190, 255];
    if (Math.hypot(x - c, y - c - size * 0.3) < size * 0.42 && y > eyeY + face * 0.7) return [196, 60, 70, 255];
    return [0, 0, 0, 0];
  };
}
export function sheet(cellSize, cols, rows) {
  return png(cellSize * cols, cellSize * rows, (x, y) => {
    const col = Math.floor(x / cellSize), row = Math.floor(y / cellSize);
    return cell(cellSize, { col: col - Math.floor((cols - 1) / 2), row: row - Math.floor((rows - 1) / 2) })(x - col * cellSize, y - row * cellSize);
  });
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = new URL('../dist/assets/', import.meta.url);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('blank.png', dir), png(1, 1, () => [0, 0, 0, 0]));
  await writeFile(new URL('hanbok-still.png', dir), png(256, 256, cell(256, { col: 0, row: 0 })));
  await writeFile(new URL('hanbok-sheet.png', dir), sheet(256, 3, 3));
  console.log('자리표시 에셋 3개를 dist/assets에 썼습니다.');
}
