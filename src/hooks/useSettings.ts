import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, Theme } from '@/types';
import { THEMES } from '@/constants';
import React from 'react';

interface SettingsState {
  settings: Settings;
  theme: Theme;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  initializeSettings: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  exportSettings: () => void;
  importSettings: (settings: Settings) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  // Profile Features
  hideActivity: false,
  hideRepositories: false,
  hideContributions: false,
  hideAllOrgs: false,
  hiddenOrgs: [],
  hideSponsors: false,
  hideAchievements: false,

  // Repository Settings
  hidePinnedRepos: false,
  hidePopularRepos: false,
  hideLanguageStats: false,
  hideContributorsSection: false,
  hideRepoDescription: false,

  // Activity Settings
  hideActivityGraph: false,
  hideActivityOverview: false,
  hideContributionStreak: false,
  hidePrivateContributions: false,

  // Profile Info
  hideStatus: false,
  hideFollowers: false,
  hideFollowing: false,
  hideLocation: false,
  hideBio: false,
  hideEmail: false,
  hideCompany: false,
  hideWebsite: false,
  hideTwitter: false,

  // Theme Settings
  enableDarkMode: false,
  customAccentColor: null,
  compactMode: false,

  // Additional Features
  hideReadme: false,
  hidePackages: false,
  hideHighlights: false,
  hideDiscussions: false,
  hideProjects: false,

  // Organization Preferences
  orgViewMode: 'grid' as const,
  orgSortOrder: 'name' as const,
  orgGrouping: 'none' as const,
};

// Helper to sync settings with Chrome storage
const syncToChrome = async (settings: Settings): Promise<void> => {
  try {
    await chrome.storage.sync.set({ settings });
    // Notify content script of settings change
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await chrome.tabs.sendMessage(tabs[0].id, {
        type: 'updateSettings',
        settings,
      });
    }
  } catch (error) {
    console.error('Failed to sync settings to Chrome:', error);
    throw error;
  }
};

// Helper to load settings from Chrome storage
const loadFromChrome = async (): Promise<Settings> => {
  try {
    const { settings } = await chrome.storage.sync.get('settings');
    return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings from Chrome:', error);
    return DEFAULT_SETTINGS;
  }
};

// Helper to download settings as JSON file
const downloadSettings = (settings: Settings): void => {
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'github-profile-settings.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      theme: THEMES[0], // Default light theme
      isSaving: false,
      isLoading: false,
      error: null,
      isInitialized: false,

      updateSettings: async (newSettings) => {
        try {
          set({ isSaving: true, error: null });
          const updatedSettings = {
            ...get().settings,
            ...newSettings,
          };

          // Sync to Chrome storage first
          await syncToChrome(updatedSettings);

          // Then update local state
          set({
            settings: updatedSettings,
            isSaving: false,
          });

          // Update theme if dark mode setting changes
          if ('enableDarkMode' in newSettings) {
            set({ theme: THEMES[newSettings.enableDarkMode ? 1 : 0] });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update settings',
            isSaving: false,
          });
          throw error;
        }
      },

      resetSettings: async () => {
        try {
          set({ isSaving: true, error: null });

          // Sync default settings to Chrome
          await syncToChrome(DEFAULT_SETTINGS);

          // Update local state
          set({
            settings: DEFAULT_SETTINGS,
            theme: THEMES[0],
            isSaving: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to reset settings',
            isSaving: false,
          });
          throw error;
        }
      },

      initializeSettings: async () => {
        try {
          set({ isSaving: true, isLoading: true, error: null });

          // Load settings from Chrome
          const chromeSettings = await loadFromChrome();

          set({
            settings: chromeSettings,
            theme: THEMES[chromeSettings.enableDarkMode ? 1 : 0],
            isInitialized: true,
            isSaving: false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize settings',
            isSaving: false,
            isLoading: false,
          });
          throw error;
        }
      },

      setTheme: (theme) => {
        set({ theme });
        get().updateSettings({ enableDarkMode: theme.name.includes('Dark') });
      },

      exportSettings: () => {
        downloadSettings(get().settings);
      },

      importSettings: async (importedSettings) => {
        try {
          set({ isSaving: true, error: null });
          const mergedSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
          await syncToChrome(mergedSettings);
          set({
            settings: mergedSettings,
            theme: THEMES[mergedSettings.enableDarkMode ? 1 : 0],
            isSaving: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to import settings',
            isSaving: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'github-customizer-settings',
      onRehydrateStorage: () => {
        // Initialize settings when storage is rehydrated
        return (state) => {
          if (state) {
            state.initializeSettings();
          }
        };
      },
    },
  ),
);

// Hook for handling settings initialization
export const useSettingsInit = () => {
  const initializeSettings = useSettings((state) => state.initializeSettings);
  const isInitialized = useSettings((state) => state.isInitialized);

  React.useEffect(() => {
    if (!isInitialized) {
      initializeSettings();
    }
  }, [isInitialized, initializeSettings]);

  return isInitialized;
};