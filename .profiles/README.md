# Development Profiles

This directory contains development browser profiles for testing the GitHub Profile Customizer extension.

## Structure

```
.profiles/
├── chromium/          # Chromium/Chrome development profile
│   └── Default/       # Default profile settings
├── firefox/           # Firefox development profile
│   └── extensions/    # Development extensions
├── create-profiles.sh # Profile creation script
├── config.js         # Profile configuration
├── user.js           # Firefox preferences
└── Preferences       # Chromium preferences
```

## Setup

1. Run the profile creation script:
```bash
chmod +x .profiles/create-profiles.sh
./.profiles/create-profiles.sh
```

2. Start development with specific browser:
```bash
# Chrome/Chromium
yarn dev:ext

# Firefox
yarn start:firefox
```

## Profile Settings

### Chrome/Chromium
- Developer mode enabled
- Extension reloading enabled
- Remote debugging enabled (port 9222)
- Console preserved across reloads

### Firefox
- Developer tools enabled
- Remote debugging enabled
- Extension signing disabled
- Storage preserved on uninstall
- Browser console enabled

## Updating Profiles

To update profile settings:

1. Modify the relevant configuration files:
    - `Preferences` for Chromium
    - `user.js` for Firefox
2. Delete the existing profile directory
3. Run `create-profiles.sh` to recreate with new settings

## Notes

- The profile directories are ignored by git to prevent committing user-specific data
- Only configuration files are tracked in version control
- Profile data is preserved between development sessions
- Remote debugging is enabled for both browsers