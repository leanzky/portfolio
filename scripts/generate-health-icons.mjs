/**
 * Generates the health tracker's home-screen icons into `public/health/`.
 *
 *   node scripts/generate-health-icons.mjs
 *
 * Written from scratch rather than pulled from a design tool so the icon has a
 * source you can edit and re-run. The mark is a walking figure — walking is the
 * one habit the whole program is built on — drawn as signed distance fields
 * (circles and round-capped capsules), which antialiases cleanly at any size
 * and needs no image library. PNG encoding is a handful of chunks over the
 * zlib that ships with Node.
 */

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "health");

const BACKGROUND = [0x1f, 0x4d, 0x38]; // deep green — reads on any wallpaper
const FIGURE = [0xe5, 0xe0, 0xd4]; // the site's cream

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
  // One filter byte (0 = none) in front of every scanline.
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y += 1) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/* ---------- signed distance fields, in a 512-unit design space ---------- */

function sdCircle(px, py, cx, cy, r) {
  return Math.hypot(px - cx, py - cy) - r;
}

/** Distance to a round-capped line segment — one limb of the figure. */
function sdCapsule(px, py, ax, ay, bx, by, r) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)));
  return Math.hypot(pax - bax * h, pay - bay * h) - r;
}

function sdRoundRect(px, py, half, radius) {
  const qx = Math.abs(px - 256) - (half - radius);
  const qy = Math.abs(py - 256) - (half - radius);
  return (
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius
  );
}

const LIMB = 18; // half the stroke width

/**
 * A walking figure, mid-stride. Every point sits inside the maskable safe zone
 * (the centre 80% circle), so the same geometry serves both icon purposes and
 * Android can crop it to any shape without clipping a foot off.
 */
function figureDistance(x, y) {
  return Math.min(
    sdCircle(x, y, 296, 116, 42), // head
    sdCapsule(x, y, 286, 186, 256, 300, LIMB), // torso
    sdCapsule(x, y, 256, 300, 318, 356, LIMB), // front thigh
    sdCapsule(x, y, 318, 356, 330, 430, LIMB), // front shin
    sdCapsule(x, y, 256, 300, 196, 350, LIMB), // back thigh
    sdCapsule(x, y, 196, 350, 150, 416, LIMB), // back shin
    sdCapsule(x, y, 286, 186, 222, 232, LIMB), // forward arm
    sdCapsule(x, y, 222, 232, 206, 292, LIMB), // forward forearm
    sdCapsule(x, y, 286, 186, 346, 244, LIMB), // trailing arm
    sdCapsule(x, y, 346, 244, 368, 300, LIMB) // trailing forearm
  );
}

/** Coverage from a distance, antialiased across roughly one output pixel. */
function coverage(distance, unitsPerPixel) {
  return Math.max(0, Math.min(1, 0.5 - distance / unitsPerPixel));
}

function render(size, { maskable }) {
  const rgba = Buffer.alloc(size * size * 4);
  const unitsPerPixel = 512 / size;
  // Maskable icons are cropped by the launcher, so they must bleed to the edge.
  const backgroundHalf = maskable ? 256 : 250;
  const backgroundRadius = maskable ? 0 : 112;

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      // Sample at the pixel centre, in design units.
      const x = (px + 0.5) * unitsPerPixel;
      const y = (py + 0.5) * unitsPerPixel;

      const bg = maskable
        ? 1
        : coverage(sdRoundRect(x, y, backgroundHalf, backgroundRadius), unitsPerPixel);
      const fg = coverage(figureDistance(x, y), unitsPerPixel);

      // Figure over background over transparency.
      const alpha = bg;
      const mix = alpha === 0 ? 0 : fg / 1;
      const offset = (py * size + px) * 4;
      for (let c = 0; c < 3; c += 1) {
        rgba[offset + c] = Math.round(BACKGROUND[c] * (1 - mix) + FIGURE[c] * mix);
      }
      rgba[offset + 3] = Math.round(alpha * 255);
    }
  }

  return encodePng(size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ["icon-192.png", 192, { maskable: false }],
  ["icon-512.png", 512, { maskable: false }],
  ["icon-maskable-512.png", 512, { maskable: true }],
];

for (const [name, size, options] of targets) {
  const png = render(size, options);
  writeFileSync(join(OUT_DIR, name), png);
  console.log(`${name}  ${size}x${size}  ${(png.length / 1024).toFixed(1)} KB`);
}
