import { GitHubProfileManager } from './GitHubProfileManager';
import type { Message, MessageResponse } from '@/types/messages';

let profileManager: GitHubProfileManager | null = null;

/**
 * Initialize the profile manager
 * @returns Initialized GitHubProfileManager instance
 */
async function initializeManager() {
  if (!profileManager) {
    profileManager = new GitHubProfileManager();
    await profileManager.initialize();
  }
  return profileManager;
}

/**
 * Ensure profile manager is initialized
 * @throws Error if profile manager is not initialized
 */
function ensureManager(): GitHubProfileManager {
  if (!profileManager) {
    throw new Error('Profile manager not initialized');
  }
  return profileManager;
}

// Message listener
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error: Error) => {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message || 'An unknown error occurred' });
    });

  return true; // Required for async response
});

/**
 * Handle individual message types
 * @param message - Chrome extension message
 * @returns Promise resolving to message response
 */
async function handleMessage(message: Message): Promise<MessageResponse> {
  try {
    const manager = ensureManager();

    switch (message.type) {
      case 'getOrganizations':
        return {
          success: true,
          organizations: manager.getOrganizations()
        };

      case 'updateSettings':
        await manager.updateSettings(message.settings);
        return { success: true };

      case 'getState':
        return {
          success: true,
          initialized: manager.isInitialized(),
          settings: manager.getSettings()
        };

      case 'updateOrganizationVisibility':
        await manager.updateOrganizationVisibility(
          message.organizationName,
          message.isHidden
        );
        return { success: true };

      case 'batchUpdateOrganizationVisibility':
        await manager.updateOrganizationVisibility(
          message.organizationNames.join(','),
          message.isHidden
        );
        return { success: true };

      case 'resetSettings':
        await manager.resetSettings();
        return { success: true };

      case 'updateTheme':
        await manager.updateTheme(message.accentColor);
        return { success: true };

      case 'toggleDarkMode':
        await manager.toggleDarkMode(message.enabled);
        return { success: true };

      case 'toggleCompactMode':
        await manager.toggleCompactMode(message.enabled);
        return { success: true };

      case 'getOrganizationStats':
        return {
          success: true,
          stats: {
            total: manager.getOrganizationCount(),
            visible: manager.getVisibleOrganizationCount(),
            hidden: manager.getHiddenOrganizations().length
          }
        };

      default:
        return {
          error: `Unknown message type: ${(message as any).type}`
        };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unknown error occurred' };
  }
}

// Initialize on load
initializeManager().catch((error) => {
  console.error('Failed to initialize profile manager:', error);
});

// Cleanup on window unload
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