#!/bin/bash

# Create profile directories
mkdir -p .profiles/{chromium,firefox}
mkdir -p .profiles/chromium/Default
mkdir -p .profiles/firefox/extensions

# Copy configuration files
cp .profiles/Preferences .profiles/chromium/Default/
cp .profiles/user.js .profiles/firefox/

# Set permissions
chmod -R 755 .profiles

echo "Development profiles created successfully"