module.exports = {
  sourceDir: './dist/',
  artifactsDir: './web-ext-artifacts',
  build: {
    overwriteDest: true
  },
  run: {
    target: ['chromium'],
    startUrl: [
      'https://github.com/profile'
    ],
    browserConsole: true,
    args: [
      '--remote-debugging-port=9222'
    ],
    chromiumProfile: './.profiles/chromium',
    keepProfileChanges: true,
    profileCreateIfMissing: true
  },
  ignoreFiles: [
    'yarn.lock',
    'package.json',
    'README.md',
    '*.log',
    '.git',
    '.gitignore',
    'node_modules',
    'src',
    'scripts',
    'web-ext-artifacts',
    '.profiles',
    'tsconfig*.json',
    'vite.config.*',
    '.eslintrc.*',
    '.prettierrc.*',
    '.yarnrc.yml'
  ]
}