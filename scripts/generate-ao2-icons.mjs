/**
 * Generates the AO II reviewer's home-screen icons into `public/ao2/`.
 *
 *   node scripts/generate-ao2-icons.mjs
 *
 * Same approach as generate-health-icons.mjs: signed distance fields for the
 * shapes, PNG encoded by hand over Node's zlib, so there is a source to edit
 * rather than a binary someone exported once. The mark is a sheet of paper
 * with a folded corner and ruled lines, in the reviewer's navy.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "ao2");

const BACKGROUND = [0x1f, 0x38, 0x64]; // the reviewer's navy
const PAPER = [0xff, 0xff, 0xff];
const INK = [0x1f, 0x38, 0x64];
const FOLD = [0xc6, 0xce, 0xda];

/* ---------- PNG encoding ---------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer) {
  let c = ~0;
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- signed distance fields, in a 512-unit design space ---------- */

function sdRoundRect(px, py, cx, cy, hx, hy, radius) {
  const qx = Math.abs(px - cx) - (hx - radius);
  const qy = Math.abs(py - cy) - (hy - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

function sdCapsule(px, py, ax, ay, bx, by, r) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

function coverage(distance, unitsPerPixel) {
  return Math.max(0, Math.min(1, 0.5 - distance / unitsPerPixel));
}

// The sheet occupies x 146..366, y 106..406: inside the maskable safe zone.
const SHEET = { x0: 146, x1: 366, y0: 106, y1: 406, fold: 70 };

/** Sheet with the top-right corner cut away along a diagonal. */
function sheetDistance(x, y) {
  const box = sdRoundRect(x, y, 256, 256, 110, 150, 16);
  const cut = x - (SHEET.x1 - SHEET.fold) > 0 && y - SHEET.y0 < SHEET.fold
    ? (x - (SHEET.x1 - SHEET.fold)) - (SHEET.y0 + SHEET.fold - y)
    : -1;
  return Math.max(box, cut / Math.SQRT2);
}

/** The small triangle that is the folded-over flap. */
function foldDistance(x, y) {
  const u = x - (SHEET.x1 - SHEET.fold);
  const v = y - SHEET.y0;
  if (u < 0 || v > SHEET.fold) return 1;
  return Math.max(u - v, -u, v - SHEET.fold) / Math.SQRT2;
}

function inkDistance(x, y) {
  return Math.min(
    sdCapsule(x, y, 186, 220, 326, 220, 9),
    sdCapsule(x, y, 186, 270, 326, 270, 9),
    sdCapsule(x, y, 186, 320, 326, 320, 9),
    sdCapsule(x, y, 186, 370, 270, 370, 9)
  );
}

function mixColor(base, over, amount) {
  return base.map((b, i) => b * (1 - amount) + over[i] * amount);
}

function render(size, { maskable }) {
  const rgba = Buffer.alloc(size * size * 4);
  const unitsPerPixel = 512 / size;
  const bgHalf = maskable ? 256 : 250;
  const bgRadius = maskable ? 0 : 112;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      const x = (px + 0.5) * unitsPerPixel;
      const y = (py + 0.5) * unitsPerPixel;

      const bg = maskable ? 1 : coverage(sdRoundRect(x, y, 256, 256, bgHalf, bgHalf, bgRadius), unitsPerPixel);
      let color = BACKGROUND;
      color = mixColor(color, PAPER, coverage(sheetDistance(x, y), unitsPerPixel));
      color = mixColor(color, FOLD, coverage(foldDistance(x, y), unitsPerPixel));
      color = mixColor(color, INK, coverage(inkDistance(x, y), unitsPerPixel));

      const offset = (py * size + px) * 4;
      for (let c = 0; c < 3; c += 1) rgba[offset + c] = Math.round(color[c]);
      rgba[offset + 3] = Math.round(bg * 255);
    }
  }
  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });

for (const [name, size, options] of [
  ["icon-192.png", 192, { maskable: false }],
  ["icon-512.png", 512, { maskable: false }],
  ["icon-maskable-512.png", 512, { maskable: true }],
]) {
  const png = render(size, options);
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`${name}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}
