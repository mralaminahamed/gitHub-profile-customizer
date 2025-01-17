import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Settings } from '@/types'

interface SettingsState {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  resetSettings: () => void
}

const DEFAULT_SETTINGS: Settings = {
  hideActivity: false,
  hideRepositories: false,
  hideContributions: false,
  hideAllOrgs: false,
  hiddenOrgs: [],
  hideSponsors: false,
  hideAchievements: false,
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'github-customizer-settings',
    },
  ),
)
