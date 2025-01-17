import { r } from './utils'
import fs from 'fs-extra'
import { getManifest } from '../src/manifest'

export async function writeManifest() {
  await fs.writeJSON(r('dist/manifest.json'), await getManifest(), { spaces: 2 })
}

export async function copyAssets() {
  await fs.copy(r('src/assets'), r('dist/assets'))
}

async function prepare() {
  await Promise.all([
    writeManifest(),
    copyAssets(),
  ])
}

prepare()
