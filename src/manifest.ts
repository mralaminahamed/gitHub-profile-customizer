import fs from 'fs-extra'
import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
import { isDev, port, r } from '../scripts/utils'

export async function getManifest() {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 3,
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    action: {
      default_icon: {
        16: './assets/icon-16.png',
        48: './assets/icon-48.png',
        128: './assets/icon-128.png',
      },
      default_popup: './dist/popup/index.html',
    },
    options_ui: {
      page: './dist/options/index.html',
      open_in_tab: true,
    },
    background: {
      service_worker: 'background/index.js',
    },
    icons: {
      16: './assets/icon-16.png',
      48: './assets/icon-48.png',
      128: './assets/icon-128.png',
    },
    permissions: [
      'storage',
      'activeTab',
    ],
    content_scripts: [{
      matches: ['https://github.com/*'],
      js: ['./dist/contentScripts/index.global.js'],
    }],
    host_permissions: ['https://github.com/*'],
    web_accessible_resources: [
      {
        resources: ['assets/*'],
        matches: ['<all_urls>'],
      },
    ],
  }

  if (isDev) {
    delete manifest.content_scripts
    manifest.permissions?.push('scripting')

    manifest.content_security_policy = {
      extension_pages: `script-src 'self' http://localhost:${port}; object-src 'self'`,
    }
  }

  return manifest
}
