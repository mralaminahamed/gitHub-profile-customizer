import fs from 'fs-extra';
import sharp from 'sharp';
import { r } from './utils';
import { getManifest } from '../src/manifest';

export async function writeManifest() {
  if (!fs.existsSync(r('dist'))) {
    fs.mkdirSync(r('dist'), { recursive: true });
  }
  await fs.writeJSON(r('dist/manifest.json'), await getManifest(), { spaces: 2 });
}

export async function buildIcons() {
  if (!fs.existsSync(r('dist/assets/icons'))) {
    fs.mkdirSync(r('dist/assets/icons'), { recursive: true });
  }

  const sizes = [16, 48, 128];

  await Promise.all(sizes.map(size => {
    return sharp(r('drafts/icon-v2.svg'))
      .resize(size, size)
      .toFile(r(`dist/assets/icons/icon-${size}.png`));
  }));
}

async function prepare() {
  await Promise.all([
    writeManifest(),
    buildIcons(),
  ]);
}

void prepare();
