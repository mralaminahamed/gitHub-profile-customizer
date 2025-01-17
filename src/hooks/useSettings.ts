import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '@/types';
import React from 'react';

interface SettingsState {
  settings: Settings;
  isSaving: boolean;
  error: string | null;
  isInitialized: boolean;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  initializeSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  hideActivity: false,
  hideRepositories: false,
  hideContributions: false,
  hideAllOrgs: false,
  hiddenOrgs: [],
  hideSponsors: false,
  hideAchievements: false,
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
    return settings || DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings from Chrome:', error);
    return DEFAULT_SETTINGS;
  }
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isSaving: false,
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
          set({ isSaving: true, error: null });

          // Load settings from Chrome
          const chromeSettings = await loadFromChrome();

          set({
            settings: chromeSettings,
            isInitialized: true,
            isSaving: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize settings',
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