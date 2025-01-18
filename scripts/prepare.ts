import fs from 'fs-extra'
import sharp from 'sharp';
import { r } from './utils'
import { getManifest } from '../src/manifest'

export async function writeManifest() {
  await fs.writeJSON(r('dist/manifest.json'), await getManifest(), { spaces: 2 })
}

export async function buildIcons() {
  const sizes = [16, 48, 128];

  await Promise.all(sizes.map(size => {
    return sharp(r('drafts/icon-v2.svg'))
      .resize(size, size)
      .toFile(r(`dist/assets/icon-${size}.png`));
  }))
}

async function prepare() {
  await Promise.all([
    writeManifest(),
    buildIcons(),
  ])
}

void prepare()
