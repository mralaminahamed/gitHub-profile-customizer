module.exports = {
  // Source and output directories
  sourceDir: './dist/',
  artifactsDir: './web-ext-artifacts',

  // Build configuration
  build: {
    overwriteDest: true,
    filename: '{name}-v{version}.zip'  // Adds version to the output filename
  },

  // Run configuration
  run: {
    target: ['chromium', 'firefox-desktop'],  // Added Firefox support
    startUrl: [
      'https://github.com/',
      'chrome://extensions/'  // Useful for debugging
    ],
    browserConsole: true,
    args: [
      '--remote-debugging-port=9222',
      '--no-sandbox'  // Helps prevent some permission issues
    ],
    chromiumProfile: './.profiles/chromium',
    firefoxProfile: './.profiles/firefox',  // Firefox profile directory
    keepProfileChanges: true,
    profileCreateIfMissing: true,
    noReload: false  // Auto-reload on changes
  },

  // Files to ignore when building
  ignoreFiles: [
    // Package management
    'yarn.lock',
    'package.json',
    'package-lock.json',
    '.yarnrc.yml',
    'node_modules',

    // Documentation
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    '*.log',

    // Version control
    '.git',
    '.gitignore',
    '.github',

    // Source and build
    'src',
    'scripts',
    'web-ext-artifacts',
    '.profiles',

    // Config files
    'tsconfig*.json',
    'vite.config.*',
    '.eslintrc.*',
    '.prettierrc.*',
    'web-ext.config.js',
    'jest.config.*',
    '.env*'
  ]
}