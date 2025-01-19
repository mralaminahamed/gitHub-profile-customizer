import browser from 'webextension-polyfill'
import type { Message, MessageResponse, Settings } from '@/types'
import { DEFAULT_SETTINGS, GITHUB_ISSUES_URL } from '@/constants';

// Track initialized tabs
const initializedTabs = new Set<number>()

// Ensure content script is loaded and initialized
async function ensureContentScript(tabId: number): Promise<boolean> {
  if (initializedTabs.has(tabId)) {
    return true
  }

  try {
    // Try to ping the content script
    await browser.tabs.sendMessage(tabId, { type: 'ping' })
    initializedTabs.add(tabId)
    return true
  } catch (error) {
    // Content script not loaded or not initialized
    try {
      // Check if we're on a GitHub page
      const tab = await browser.tabs.get(tabId)
      if (!tab.url?.startsWith('https://github.com')) {
        return false
      }

      // Inject content script
      await browser.scripting.executeScript({
        target: { tabId },
        files: ['./contentScripts/index.global.js']
      })

      // Wait for initialization
      let attempts = 0
      const maxAttempts = 5
      while (attempts < maxAttempts) {
        try {
          await browser.tabs.sendMessage(tabId, { type: 'ping' })
          initializedTabs.add(tabId)
          return true
        } catch {
          attempts++
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      return false
    } catch {
      return false
    }
  }
}

// Type guard for Message type
function isValidMessage(message: unknown): message is Message {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof (message as Message).type === 'string'
  )
}

// Handle messages that require background script processing
browser.runtime.onMessage.addListener(
  async (message: unknown): Promise<MessageResponse> => {
    // Type guard to ensure message is of type Message
    if (!isValidMessage(message)) {
      return { error: 'Invalid message format' }
    }

    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      const activeTab = tabs[0]

      if (!activeTab?.id) {
        return { error: 'No active tab found' }
      }

      // Ensure content script is loaded and initialized
      const isInitialized = await ensureContentScript(activeTab.id)
      if (!isInitialized) {
        return { error: 'Failed to initialize content script' }
      }

      // Handle messages based on type
      switch (message.type) {
        case 'getState':
        case 'getOrganizations':
        case 'getOrganizationStats':
        case 'updateSettings':
        case 'updateOrganizationVisibility':
        case 'batchUpdateOrganizationVisibility':
        case 'resetSettings':
        case 'updateTheme':
        case 'toggleDarkMode':
        case 'toggleCompactMode':
          return browser.tabs.sendMessage(activeTab.id, message)

        default:
          return { error: `Unknown message type: ${JSON.stringify(message) ?? ''}` }
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
    }
  }
)

// Handle installation and updates
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings on installation
    await browser.storage.sync.set({ settings: DEFAULT_SETTINGS })
  } else if (details.reason === 'update') {
    // Handle extension updates
    const { settings } = await browser.storage.sync.get('settings')
    if (settings) {
      // Merge existing settings with any new default settings
      const updatedSettings: Settings = {
        ...DEFAULT_SETTINGS,
        ...settings,
      }
      await browser.storage.sync.set({ settings: updatedSettings })
    } else {
      // If no settings exist, set defaults
      await browser.storage.sync.set({ settings: DEFAULT_SETTINGS })
    }
  }

  // Clear initialized tabs on install/update
  initializedTabs.clear()
})

// Handle uninstallation
browser.runtime.setUninstallURL(GITHUB_ISSUES_URL)

// Listen for changes in storage
browser.storage.onChanged.addListener(async (changes) => {
  if (changes.settings) {
    // Notify all initialized GitHub tabs about settings changes
    const githubTabs = await browser.tabs.query({ url: 'https://github.com/*' })
    for (const tab of githubTabs) {
      if (tab.id && initializedTabs.has(tab.id)) {
        try {
          await browser.tabs.sendMessage(tab.id, {
            type: 'updateSettings',
            settings: changes.settings.newValue,
          })
        } catch (error) {
          console.error(`Failed to update settings for tab ${tab.id}:`, error)
          initializedTabs.delete(tab.id)
        }
      }
    }
  }
})

// Handle tab updates
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('https://github.com')) {
    initializedTabs.delete(tabId)
    await ensureContentScript(tabId)
  }
})

// Handle tab removal
browser.tabs.onRemoved.addListener((tabId) => {
  initializedTabs.delete(tabId)
})

// Handle extension context invalidation
browser.runtime.onSuspend.addListener(async () => {
  const githubTabs = await browser.tabs.query({ url: 'https://github.com/*' })
  for (const tab of githubTabs) {
    if (tab.id && initializedTabs.has(tab.id)) {
      try {
        await browser.tabs.sendMessage(tab.id, { type: 'cleanup' })
      } catch (error) {
        console.error(`Failed to cleanup tab ${tab.id}:`, error)
      }
      initializedTabs.delete(tab.id)
    }
  }
})