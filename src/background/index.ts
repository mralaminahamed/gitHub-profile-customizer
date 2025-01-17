// import { getManifest } from '../manifest'
import type { Message } from '@/types/messages'
import browser from 'webextension-polyfill'

// Initialize manifest
// void getManifest()

// Listen for installation or update
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on installation
    browser.storage.sync.set({
      settings: {
        hideActivity: false,
        hideRepositories: false,
        hideContributions: false,
        hideAllOrgs: false,
        hiddenOrgs: [],
        hideSponsors: false,
        hideAchievements: false,
      }
    })
  }
})

// Handle messages that require background script processing
browser.runtime.onMessage.addListener(
  async (message: unknown) => {
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

      switch (message.type) {
        case 'getState':
        case 'getOrganizations':
        case 'updateSettings':
        case 'updateOrganizationVisibility':
        case 'batchUpdateOrganizationVisibility':
        case 'resetSettings':
          return browser.tabs.sendMessage(activeTab.id, message)

        default:
          return { error: `Unknown message type: ${JSON.stringify(message) ?? ''}` }
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
    }
  }
)

// Type guard for Message type
function isValidMessage(message: unknown): message is Message {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    typeof (message as Message).type === 'string'
  )
}