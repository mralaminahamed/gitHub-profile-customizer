module.exports = {
  chromium: {
    profileDir: '.profiles/chromium',
    args: [
      '--no-first-run',
      '--disable-sync',
      '--disable-extensions-except=${extensionPath}',
      '--load-extension=${extensionPath}',
      '--remote-debugging-port=9222'
    ],
    env: {
      DEVELOPMENT: 'true'
    }
  },
  firefox: {
    profileDir: '.profiles/firefox',
    args: [
      '-no-remote',
      '-profile',
      '${profilePath}',
    ],
    env: {
      MOZ_WEBEXT_PROFILE: '${profilePath}'
    }
  }
}