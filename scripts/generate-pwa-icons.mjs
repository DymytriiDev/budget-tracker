import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const svgIcon = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.125)}" fill="#0f1117"/>
  <text x="${size / 2}" y="${size * 0.66}" font-family="system-ui, -apple-system, sans-serif" font-size="${size * 0.5}" font-weight="700" fill="#22c55e" text-anchor="middle">$</text>
</svg>
`;

const icons = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.ico', size: 48 },
];

async function generateIcons() {
  for (const icon of icons) {
    const svg = Buffer.from(svgIcon(icon.size));
    await sharp(svg)
      .resize(icon.size, icon.size)
      .png()
      .toFile(join(publicDir, icon.name));
    console.log(`Generated ${icon.name}`);
  }
}

generateIcons().catch(console.error);
