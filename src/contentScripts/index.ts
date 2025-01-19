import { GitHubProfileManager } from './GitHubProfileManager';
import type { Message, MessageResponse } from '@/types/messages';

let profileManager: GitHubProfileManager | null = null;

/**
 * Initialize the profile manager
 * @returns Initialized GitHubProfileManager instance
 */
async function initializeManager(): Promise<GitHubProfileManager> {
  if (!profileManager) {
    profileManager = new GitHubProfileManager();
    const success = await profileManager.initialize();
    if (!success) {
      throw new Error('Failed to initialize GitHubProfileManager');
    }
  }
  return profileManager;
}

/**
 * Handle individual message types
 * @param message - Chrome extension message
 * @returns Promise resolving to message response
 */
async function handleMessage(message: Message): Promise<MessageResponse> {
  try {
    // Special case: handle ping message for initialization check
    if ((message as any).type === 'ping') {
      return {
        success: true,
      };
    }

    // Initialize manager if needed
    const manager = await initializeManager();

    switch (message.type) {
      case 'getOrganizations': {
        return {
          success: true,
          organizations: manager.getOrganizations(),
        };
      }

      case 'getOrganizationStats': {
        return {
          success: true,
          stats: manager.getOrganizationStats(),
        };
      }

      case 'updateSettings': {
        await manager.updateSettings(message.settings);
        return {
          success: true
        };
      }

      case 'getState': {
        return {
          success: true,
          initialized: manager.isInitialized(),
          settings: manager.getSettings()
        };
      }

      case 'updateOrganizationVisibility': {
        await manager.updateOrganizationVisibility(
          message.organizationName,
          message.isHidden
        );
        return {
          success: true
        };
      }

      case 'batchUpdateOrganizationVisibility': {
        await Promise.all(
          message.organizationNames.map(name =>
            manager.updateOrganizationVisibility(name, message.isHidden)
          )
        );
        return {
          success: true
        };
      }

      case 'resetSettings': {
        await manager.resetSettings();
        return {
          success: true
        };
      }

      case 'updateTheme': {
        await manager.updateTheme(message.accentColor);
        return {
          success: true
        };
      }

      case 'toggleDarkMode': {
        await manager.toggleDarkMode(message.enabled);
        return {
          success: true
        };
      }

      case 'toggleCompactMode': {
        await manager.toggleCompactMode(message.enabled);
        return {
          success: true
        };
      }

      default: {
        return {
          error: `Invalid message type: ${(message as any).type}`
        };
      }
    }
  } catch (error: any) {
    console.error('Error handling message:', error);
    return {
      error: error.message
    }
  }
}

// Set up message listener
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {

  console.log('Received message:', message);
  console.log('Sender:', _sender);
  console.log('Send Response:', sendResponse);


  handleMessage(message)
    .then(sendResponse)
    .catch(error => sendResponse({ error: error.message }));

  return true; // Indicate async response
});

// Initialize manager when content script loads
const initContent = async () => {
  try {
    await initializeManager();

    // Signal that content script is ready
    chrome.runtime.sendMessage({ success: true, type: 'contentScriptReady' })
      .catch(error => console.error('Failed to send ready message:', error));
  } catch (error) {
    console.error('Failed to initialize content script:', error);
  }
};

// Run initialization
initContent();

// Cleanup on window unload
window.addEventListener('unload', () => {
  if (profileManager) {
    profileManager.destroy();
    profileManager = null;
  }
});

// Handle extension context invalidation
chrome.runtime.onSuspend?.addListener(() => {
  if (profileManager) {
    profileManager.destroy();
    profileManager = null;
  }
});