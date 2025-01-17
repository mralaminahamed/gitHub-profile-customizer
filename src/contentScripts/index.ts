// src/contentScripts/index.ts
import { GitHubProfileManager } from './GitHubProfileManager';
import type { Message } from '@/types/messages';

let profileManager: GitHubProfileManager | null = null;

/**
 * Initialize the profile manager
 */
async function initializeManager() {
  if (!profileManager) {
    profileManager = new GitHubProfileManager();
    await profileManager.initialize();
  }
  return profileManager;
}

// Message listener with unused parameter prefixed with underscore
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  if (!profileManager) {
    sendResponse({ error: 'Profile manager not initialized' });
    return true;
  }

  handleMessage(message, sendResponse).catch((error) => {
    console.error('Error handling message:', error);
    sendResponse({ error: error.message || 'An unknown error occurred' });
  });

  return true; // Required for async response
});

/**
 * Handle individual message types
 */
async function handleMessage(message: Message, sendResponse: (response: any) => void) {
  try {
    switch (message.type) {
      case 'getOrganizations':
        const organizations = profileManager?.getOrganizations();
        sendResponse({ organizations });
        break;

      case 'updateSettings':
        await profileManager?.updateSettings(message.settings);
        sendResponse({ success: true });
        break;

      case 'getState':
        sendResponse({
          initialized: profileManager?.getInitializationState(),
          settings: profileManager?.getCurrentSettings(),
        });
        break;

      case 'updateOrganizationVisibility':
        if (!profileManager) throw new Error('Profile manager not initialized');

        const currentSettings = profileManager.getCurrentSettings();
        if (!currentSettings) throw new Error('Settings not initialized');

        const { organizationName, isHidden } = message;
        const hiddenOrgs = new Set(currentSettings.hiddenOrgs);

        if (isHidden) {
          hiddenOrgs.add(organizationName);
        } else {
          hiddenOrgs.delete(organizationName);
        }

        await profileManager.updateSettings({
          hiddenOrgs: Array.from(hiddenOrgs),
        });

        sendResponse({ success: true });
        break;

      case 'batchUpdateOrganizationVisibility':
        if (!profileManager) throw new Error('Profile manager not initialized');

        const settings = profileManager.getCurrentSettings();
        if (!settings) throw new Error('Settings not initialized');

        const { organizationNames, isHidden: batchIsHidden } = message;
        const updatedHiddenOrgs = new Set(settings.hiddenOrgs);

        organizationNames.forEach(orgName => {
          if (batchIsHidden) {
            updatedHiddenOrgs.add(orgName);
          } else {
            updatedHiddenOrgs.delete(orgName);
          }
        });

        await profileManager.updateSettings({
          hiddenOrgs: Array.from(updatedHiddenOrgs),
        });

        sendResponse({ success: true });
        break;

      case 'resetSettings':
        await profileManager?.resetSettings();
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: `Unknown message type: ${(message as any).type}` });
    }
  } catch (error) {
    if (error instanceof Error) {
      sendResponse({ error: error.message });
    } else {
      sendResponse({ error: 'An unknown error occurred' });
    }
  }
}

/**
 * Initialize on load
 */
initializeManager().catch((error) => {
  console.error('Failed to initialize profile manager:', error);
});

/**
 * Cleanup on window unload
 */
window.addEventListener('unload', () => {
  if (profileManager) {
    profileManager.destroy();
    profileManager = null;
  }
});

// Handle extension context invalidation
chrome.runtime.onSuspend.addListener(() => {
  if (profileManager) {
    profileManager.destroy();
    profileManager = null;
  }
});