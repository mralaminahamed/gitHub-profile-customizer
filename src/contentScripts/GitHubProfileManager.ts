// src/contentScripts/GitHubProfileManager.ts
import type { Organization, OrganizationStats, Settings } from '@/types';
import { SELECTORS } from './constants';

export class GitHubProfileManager {
  private settings: Settings | null = null;
  private initialized = false;
  private mutationObserver: MutationObserver | null = null;
  private themeChangeObserver: MutationObserver | null = null;
  private readonly animationDuration = 300; // ms
  private readonly styleId = 'github-profile-customizer-styles';

  async initialize() {
    if (this.initialized) return;

    try {
      this.injectStyles();
      await this.loadSettings();
      this.setupMutationObserver();
      this.setupThemeObserver();
      this.applySettings();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize GitHubProfileManager:', error);
      return false;
    }
  }

  private injectStyles() {
    const existingStyle = document.getElementById(this.styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = this.styleId;
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

      /* Theme customization */
      :root[data-custom-theme="true"] {
        --color-accent-fg: var(--custom-accent-color) !important;
        --color-accent-emphasis: var(--custom-accent-color) !important;
        --color-accent-muted: var(--custom-accent-muted) !important;
      }

      /* Compact mode styles */
      .js-yearly-contributions[data-compact-mode="true"],
      .js-pinned-items-reorder-container[data-compact-mode="true"],
      .js-profile-repositories-section[data-compact-mode="true"] {
        margin-top: 0.5rem !important;
        margin-bottom: 0.5rem !important;
      }

      [data-compact-mode="true"] .pinned-item-list-item {
        margin-bottom: 0.5rem !important;
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
      ${Object.values(SELECTORS).flatMap(group => Object.values(group)).join(',\n')} {
        transition: opacity ${this.animationDuration}ms ease-out,
                    height ${this.animationDuration}ms ease-out;
      }

      /* Prevent layout shifts */
      .js-pinned-items-reorder-container,
      .js-profile-repositories-section,
      .js-yearly-contributions,
      .contribution-activity-listing {
        min-height: 0;
        height: auto;
      }
    `;
    document.head.appendChild(style);
  }

  private async loadSettings(): Promise<void> {
    try {
      const { settings } = await chrome.storage.sync.get('settings');
      this.settings = settings || this.getDefaultSettings();
      this.applyThemeSettings();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = this.getDefaultSettings();
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
      hideStatus: false,
      hideFollowers: false,
      hideFollowing: false,
      hideLocation: false,
      hideBio: false,
      hideEmail: false,
      hideCompany: false,
      hideWebsite: false,
      hideTwitter: false,
      hidePinnedRepos: false,
      hidePopularRepos: false,
      hideLanguageStats: false,
      hideContributorsSection: false,
      hideRepoDescription: false,
      hideActivityGraph: false,
      hideActivityOverview: false,
      hideContributionStreak: false,
      hidePrivateContributions: false,
      hideReadme: false,
      hidePackages: false,
      hideHighlights: false,
      hideDiscussions: false,
      hideProjects: false,
      enableDarkMode: false,
      customAccentColor: null,
      compactMode: false,
      orgViewMode: 'grid',
      orgSortOrder: 'name',
      orgGrouping: 'none',
    };
  }

  private setupThemeObserver() {
    if (this.themeChangeObserver) {
      this.themeChangeObserver.disconnect();
    }

    this.themeChangeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-color-mode' ||
          mutation.attributeName === 'data-dark-theme' ||
          mutation.attributeName === 'data-light-theme') {
          this.applyThemeSettings();
        }
      });
    });

    const htmlElement = document.documentElement;
    this.themeChangeObserver.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['data-color-mode', 'data-dark-theme', 'data-light-theme'],
    });
  }

  private applyThemeSettings() {
    if (!this.settings) return;

    const root = document.documentElement;
    const isDarkMode = this.settings.enableDarkMode;
    const accentColor = this.settings.customAccentColor;

    if (isDarkMode) {
      root.setAttribute('data-color-mode', 'dark');
    }

    if (accentColor) {
      root.style.setProperty('--custom-accent-color', accentColor);
      root.style.setProperty('--custom-accent-muted', `${accentColor}33`);
      root.setAttribute('data-custom-theme', 'true');
    } else {
      root.removeAttribute('data-custom-theme');
    }

    document.querySelectorAll('[data-compact-mode]').forEach(element => {
      element.setAttribute('data-compact-mode', String(this.settings?.compactMode));
    });
  }

  private setupMutationObserver() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'attributes') {
          const hasRelevantChanges = Array.from(mutation.addedNodes).some(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return false;
            const element = node as Element;
            return Object.values(SELECTORS).some(selectorGroup =>
              Object.values(selectorGroup).some(selector =>
                element.matches?.(selector) || element.querySelector?.(selector)
              )
            );
          });

          if (hasRelevantChanges) {
            shouldUpdate = true;
            break;
          }
        }
      }

      if (shouldUpdate) {
        this.applySettings();
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private applySettings() {
    if (!this.settings) return;

    // Apply visibility settings for all sections
    Object.entries(SELECTORS).forEach(([section, selectors]) => {
      Object.entries(selectors).forEach(([, selector]) => {
        const settingKey = `hide${section.charAt(0).toUpperCase() + section.slice(1)}` as keyof Settings;
        if (settingKey in this.settings!) {
          this.toggleElements(selector, this.settings![settingKey] as boolean);
        }
      });
    });

    // Handle organizations visibility
    this.handleOrganizationsVisibility();

    // Apply theme and layout settings
    this.applyThemeSettings();
  }

  private handleOrganizationsVisibility() {
    const orgContainer = document.querySelector(SELECTORS.organizations.container);
    if (!orgContainer || !this.settings) return;

    if (this.settings.hideAllOrgs) {
      this.toggleElements(SELECTORS.organizations.container, true);
    } else {
      this.toggleElements(SELECTORS.organizations.container, false);
      document.querySelectorAll(SELECTORS.organizations.items).forEach(org => {
        const orgName = org.getAttribute('aria-label');
        if (orgName && this.settings?.hiddenOrgs.includes(orgName)) {
          org.classList.add('gh-org-hidden');
        } else {
          org.classList.remove('gh-org-hidden');
        }
      });
    }
  }

  private toggleElements(selector: string, hide: boolean) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (hide) {
        this.fadeOutElement(element);
      } else {
        this.fadeInElement(element);
      }
    });
  }

  private fadeOutElement(element: Element) {
    element.classList.add('gh-fade-out');
    setTimeout(() => {
      element.classList.add('gh-hidden');
    }, this.animationDuration);
  }

  private fadeInElement(element: Element) {
    element.classList.remove('gh-hidden');
    // Force a reflow to ensure the transition works
    (element as HTMLElement).offsetHeight;
    element.classList.remove('gh-fade-out');
    element.classList.add('gh-fade-in');
    setTimeout(() => {
      element.classList.remove('gh-fade-in');
    }, this.animationDuration);
  }

  public getOrganizations(): Organization[] {
    const orgs: Organization[] = [];
    document.querySelectorAll(SELECTORS.organizations.items).forEach(org => {
      const img = org.querySelector('img');
      const link = org as HTMLAnchorElement;
      const name = org.getAttribute('aria-label') || '';
      const type = this.determineOrgType(org);
      const memberCount = this.extractMemberCount(org);
      const lastActive = this.extractLastActive(org);

      orgs.push({
        name,
        avatar: img?.src || '',
        url: link.href || '',
        type,
        memberCount,
        lastActive,
        isAdmin: org.classList.contains('admin'),
      });
    });
    return orgs;
  }

  public getOrganizationStats(): OrganizationStats {
    const organizations = this.getOrganizations();
    const total = organizations.length;
    const visible = organizations.filter(org => !org.isHidden).length;
    const hidden = total - visible;

    const byType = organizations.reduce((acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1;
      return acc;
    }, { personal: 0, business: 0, opensource: 0, other: 0 });

    return { total, visible, hidden, byType };
  }

  private determineOrgType(element: Element): 'personal' | 'business' | 'opensource' | 'other' {
    const description = element.getAttribute('aria-description')?.toLowerCase() || '';
    if (description.includes('personal')) return 'personal';
    if (description.includes('business')) return 'business';
    if (description.includes('open source')) return 'opensource';
    return 'other';
  }

  private extractMemberCount(element: Element): number | undefined {
    const memberText = element.querySelector('.member-count')?.textContent;
    if (!memberText) return undefined;
    const count = parseInt(memberText.replace(/[^0-9]/g, ''));
    return isNaN(count) ? undefined : count;
  }

  private extractLastActive(element: Element): string | undefined {
    const timestamp = element.querySelector('relative-time')?.getAttribute('datetime');
    if (!timestamp) return undefined;
    return new Date(timestamp).toISOString();
  }

  public async toggleCompactMode(enabled?: boolean): Promise<void> {
    if (!this.settings) return;

    try {
      const newValue = enabled ?? !this.settings.compactMode;
      await this.updateSettings({ compactMode: newValue });

      // Immediately update compact mode attributes
      Object.values(SELECTORS).forEach(selectorGroup => {
        Object.values(selectorGroup).forEach(selector => {
          document.querySelectorAll(selector).forEach(element => {
            element.setAttribute('data-compact-mode', String(newValue));
          });
        });
      });
    } catch (error) {
      console.error('Failed to toggle compact mode:', error);
      throw error;
    }
  }

  public async updateSettings(newSettings: Partial<Settings>): Promise<boolean> {
    try {
      this.settings = { ...this.settings, ...newSettings } as Settings;
      await chrome.storage.sync.set({ settings: this.settings });
      this.applySettings();
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  public async resetSettings(): Promise<boolean> {
    try {
      this.settings = this.getDefaultSettings();
      await chrome.storage.sync.set({ settings: this.settings });
      this.applySettings();
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  }

  public async updateTheme(accentColor: string | null): Promise<void> {
    if (!this.settings) return;

    try {
      await this.updateSettings({ customAccentColor: accentColor });
      this.applyThemeSettings();
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  }

  public async toggleDarkMode(enabled?: boolean): Promise<void> {
    if (!this.settings) return;

    try {
      const newValue = enabled ?? !this.settings.enableDarkMode;
      await this.updateSettings({ enableDarkMode: newValue });
    } catch (error) {
      console.error('Failed to toggle dark mode:', error);
      throw error;
    }
  }

  public async updateOrganizationVisibility(
    orgName: string,
    isHidden: boolean
  ): Promise<void> {
    if (!this.settings) return;

    try {
      const hiddenOrgs = new Set(this.settings.hiddenOrgs);
      if (isHidden) {
        hiddenOrgs.add(orgName);
      } else {
        hiddenOrgs.delete(orgName);
      }

      await this.updateSettings({ hiddenOrgs: Array.from(hiddenOrgs) });
    } catch (error) {
      console.error('Failed to update organization visibility:', error);
      throw error;
    }
  }

  public destroy(): void {
    // Disconnect observers
    this.mutationObserver?.disconnect();
    this.themeChangeObserver?.disconnect();

    // Remove injected styles
    document.getElementById(this.styleId)?.remove();

    // Reset theme customizations
    const root = document.documentElement;
    root.removeAttribute('data-custom-theme');
    root.style.removeProperty('--custom-accent-color');
    root.style.removeProperty('--custom-accent-muted');

    // Reset color mode if dark mode was enabled
    if (this.settings?.enableDarkMode) {
      root.setAttribute('data-color-mode', 'light');
    }

    // Remove compact mode attributes
    document.querySelectorAll('[data-compact-mode]').forEach(element => {
      element.removeAttribute('data-compact-mode');
    });

    // Show all hidden elements and remove transition classes
    const classesToRemove = ['gh-hidden', 'gh-fade-out', 'gh-fade-in', 'gh-org-hidden'];
    document.querySelectorAll(classesToRemove.map(c => `.${c}`).join(', ')).forEach(element => {
      element.classList.remove(...classesToRemove);
    });

    // Reset state
    this.initialized = false;
    this.settings = null;
    this.mutationObserver = null;
    this.themeChangeObserver = null;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getSettings(): Settings | null {
    return this.settings;
  }

  public getHiddenOrganizations(): string[] {
    return this.settings?.hiddenOrgs || [];
  }

  public isOrganizationHidden(orgName: string): boolean {
    return this.settings?.hiddenOrgs.includes(orgName) || false;
  }

  public isFeatureEnabled(featureKey: keyof Settings): boolean {
    if (!this.settings || !(featureKey in this.settings)) {
      return false;
    }
    return Boolean(this.settings[featureKey]);
  }

  public getOrganizationCount(): number {
    return document.querySelectorAll(SELECTORS.organizations.items).length;
  }

  public getVisibleOrganizationCount(): number {
    const total = this.getOrganizationCount();
    const hidden = this.settings?.hiddenOrgs.length || 0;
    return total - hidden;
  }

}