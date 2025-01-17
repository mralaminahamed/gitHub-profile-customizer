// src/contentScripts/GitHubProfileManager.ts
import type { Organization, Settings } from '@/types';
import { SELECTORS } from './constants'

export class GitHubProfileManager {
  private settings: Settings | null = null
  private initialized = false
  private mutationObserver: MutationObserver | null = null
  private animationDuration = 300 // ms
  private styleId = 'github-profile-customizer-styles'

  async initialize() {
    if (this.initialized) return

    try {
      this.injectStyles()
      await this.loadSettings()
      this.setupMutationObserver()
      this.applySettings()
      this.setupMessageListeners()
      this.initialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize GitHubProfileManager:', error)
      return false
    }
  }

  private injectStyles() {
    // Remove existing style element if it exists
    const existingStyle = document.getElementById(this.styleId)
    if (existingStyle) {
      existingStyle.remove()
    }

    const style = document.createElement('style')
    style.id = this.styleId
    style.textContent = `
      .gh-hidden {
        display: none !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        overflow: hidden !important;
      }

      .gh-fade-out {
        opacity: 0 !important;
        transition: opacity ${this.animationDuration}ms ease-out !important;
      }

      .gh-org-hidden {
        display: none !important;
      }

      .gh-fade-in {
        opacity: 1 !important;
        transition: opacity ${this.animationDuration}ms ease-in !important;
      }

      /* Organization hover effects */
      .avatar-group-item:not(.gh-org-hidden) {
        transition: transform 0.2s ease-out, opacity 0.2s ease-out;
      }

      .avatar-group-item:not(.gh-org-hidden):hover {
        transform: scale(1.1);
        opacity: 0.9;
      }

      /* Smooth transitions for all hideable elements */
      .js-yearly-contributions,
      .js-pinned-items-reorder-container,
      .js-profile-repositories-section,
      .contribution-activity-listing,
      .border-top.color-border-muted.pt-3.mt-3.clearfix.hide-sm.hide-md,
      .js-profile-sponsors-section,
      .js-profile-achievements {
        transition: opacity ${this.animationDuration}ms ease-out, 
                    height ${this.animationDuration}ms ease-out;
      }

      /* Prevent layout shifts when hiding elements */
      .js-pinned-items-reorder-container,
      .js-profile-repositories-section,
      .js-yearly-contributions,
      .contribution-activity-listing {
        min-height: 0;
        height: auto;
      }
    `
    document.head.appendChild(style)
  }

  private async loadSettings(): Promise<void> {
    try {
      const { settings } = await chrome.storage.sync.get('settings')
      this.settings = settings || this.getDefaultSettings()
    } catch (error) {
      console.error('Failed to load settings:', error)
      this.settings = this.getDefaultSettings()
    }
  }

  private getDefaultSettings(): Settings {
    return {
      hideActivity: false,
      hideRepositories: false,
      hideContributions: false,
      hideAllOrgs: false,
      hiddenOrgs: [],
      hideSponsors: false,
      hideAchievements: false,
    }
  }

  private setupMutationObserver() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false

      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          const hasRelevantChanges = Array.from(mutation.addedNodes).some(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return false
            const element = node as Element
            return Object.values(SELECTORS).some(selectorGroup =>
              Object.values(selectorGroup).some(selector =>
                element.matches?.(selector) || element.querySelector?.(selector)
              )
            )
          })

          if (hasRelevantChanges) {
            shouldUpdate = true
            break
          }
        }
      }

      if (shouldUpdate) {
        this.applySettings()
      }
    })

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  private setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!this.initialized) {
        sendResponse({ error: 'Manager not initialized' })
        return true
      }

      switch (message.type) {
        case 'getOrganizations':
          sendResponse({ organizations: this.getOrganizations() })
          break

        case 'updateSettings':
          this.updateSettings(message.settings)
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ error: error.message }))
          break

        case 'getState':
          sendResponse({
            initialized: this.initialized,
            settings: this.settings
          })
          break

        case 'resetSettings':
          this.resetSettings()
            .then(() => sendResponse({ success: true }))
            .catch(error => sendResponse({ error: error.message }))
          break

        default:
          sendResponse({ error: 'Unknown message type' })
      }

      return true // Required for async response
    })
  }

  private applySettings() {
    if (!this.settings) return

    // Handle activity sections
    this.toggleElements(SELECTORS.activity.container, this.settings.hideActivity)
    this.toggleElements(SELECTORS.activity.graph, this.settings.hideActivity)
    this.toggleElements(SELECTORS.activity.activityOverview, this.settings.hideActivity)

    // Handle repositories
    this.toggleElements(SELECTORS.repositories.pinnedRepos, this.settings.hideRepositories)
    this.toggleElements(SELECTORS.repositories.popularRepos, this.settings.hideRepositories)

    // Handle contributions
    this.toggleElements(SELECTORS.contributions.calendar, this.settings.hideContributions)
    this.toggleElements(SELECTORS.contributions.activityListing, this.settings.hideContributions)

    // Handle organizations
    const orgContainer = document.querySelector(SELECTORS.organizations.container)
    if (orgContainer) {
      if (this.settings.hideAllOrgs) {
        this.hideElements(SELECTORS.organizations.container)
      } else {
        this.showElements(SELECTORS.organizations.container)
        // Handle individual organizations
        document.querySelectorAll(SELECTORS.organizations.items).forEach(org => {
          const orgName = org.getAttribute('aria-label')
          if (orgName && this.settings?.hiddenOrgs.includes(orgName)) {
            org.classList.add('gh-org-hidden')
          } else {
            org.classList.remove('gh-org-hidden')
          }
        })
      }
    }

    // Handle sponsors
    this.toggleElements(SELECTORS.sponsors.section, this.settings.hideSponsors)

    // Handle achievements
    this.toggleElements(SELECTORS.achievements.section, this.settings.hideAchievements)
  }

  private toggleElements(selector: string, hide: boolean) {
    if (hide) {
      this.hideElements(selector)
    } else {
      this.showElements(selector)
    }
  }

  private hideElements(selector: string) {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      element.classList.add('gh-fade-out')
      setTimeout(() => {
        element.classList.add('gh-hidden')
      }, this.animationDuration)
    })
  }

  // src/contentScripts/GitHubProfileManager.ts (updated showElements method)
  private showElements(selector: string) {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      // @ts-ignore
      element.classList.remove('gh-hidden')
        // Force a reflow to ensure the transition works
        // Use HTMLElement type assertion for offsetHeight
        (element as HTMLElement).offsetHeight
      element.classList.remove('gh-fade-out')
      element.classList.add('gh-fade-in')
      setTimeout(() => {
        element.classList.remove('gh-fade-in')
      }, this.animationDuration)
    })
  }

// Updated getOrganizations method with proper typing
  getOrganizations(): Organization[] {
    const orgs: Organization[] = []
    document.querySelectorAll(SELECTORS.organizations.items).forEach(org => {
      const img = org.querySelector('img')
      const link = org as HTMLAnchorElement
      orgs.push({
        name: org.getAttribute('aria-label') || '',
        avatar: img ? img.src : '',
        url: link.href || '',
        // @ts-ignore
        organizations: [] // Add this to match the Organization interface
      })
    })
    return orgs
  }

// Add public methods to access private properties
  public getInitializationState(): boolean {
    return this.initialized
  }

  public getCurrentSettings(): Settings | null {
    return this.settings
  }


  async updateSettings(newSettings: Partial<Settings>) {
    try {
      this.settings = { ...this.settings, ...newSettings } as Settings
      await chrome.storage.sync.set({ settings: this.settings })
      this.applySettings()
      return true
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }

  async resetSettings() {
    try {
      this.settings = this.getDefaultSettings()
      await chrome.storage.sync.set({ settings: this.settings })
      this.applySettings()
      return true
    } catch (error) {
      console.error('Failed to reset settings:', error)
      throw error
    }
  }

  isInitialized() {
    return this.initialized
  }

  getSettings() {
    return this.settings
  }

  destroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
    }

    // Remove injected styles
    const style = document.getElementById(this.styleId)
    if (style) {
      style.remove()
    }

    // Show all hidden elements
    document.querySelectorAll('.gh-hidden, .gh-fade-out, .gh-org-hidden').forEach(element => {
      element.classList.remove('gh-hidden', 'gh-fade-out', 'gh-org-hidden')
    })

    this.initialized = false
    this.settings = null
  }
}