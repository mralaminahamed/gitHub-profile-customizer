import React from 'react';
import type { Settings, Theme } from '@/types';
import { SettingsGroup } from '@/popup/components/Supporting';
import { THEMES } from '@/constants';
import { ThemeButton } from '@/popup/components/ThemeButton';
import { ColorPicker, ExportImport } from '@/popup/components/Configuration';

interface TabProps {
  settings: Settings;
  onSettingChange: (key: keyof Settings) => (value: any) => void;
}

const SettingsTab: React.FC<TabProps & {
  onExport: () => void,
  onImport: (settings: Settings) => void,
  onThemeChange: (theme: Theme) => void,
  onReset?: () => Promise<void>
// @ts-ignore
}> = ({ settings, onSettingChange, onExport, onImport, onThemeChange, onReset }) => (
  <div className="space-y-8">
    {/* Display Settings */}
    <SettingsGroup
      title="Display Preferences"
      description="Customize the appearance of your profile"
      items={[
        {
          id: 'darkMode',
          title: 'Dark Mode',
          description: 'Use dark color scheme',
          setting: 'enableDarkMode'
        },
        {
          id: 'compactMode',
          title: 'Compact Mode',
          description: 'Reduce spacing between elements',
          setting: 'compactMode'
        }
      ]}
      settings={settings}
      onChange={onSettingChange}
    />

    {/* Theme Customization */}
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Theme Customization
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Choose a preset theme or customize colors
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {THEMES.map((theme) => (
          <ThemeButton
            key={theme.name}
            theme={theme}
            isActive={settings.customAccentColor === theme.accentColor}
            onClick={() => onThemeChange(theme)}
          />
        ))}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Custom Colors
        </h4>
        <ColorPicker
          value={settings.customAccentColor || '#0969DA'}
          onChange={(color: any) => onSettingChange('customAccentColor')(color)}
          presetColors={THEMES.map(theme => theme.accentColor)}
        />
      </div>
    </div>

    {/* Additional Features */}
    <SettingsGroup
      title="Additional Features"
      description="Toggle visibility of extra profile sections"
      items={[
        {
          id: 'packages',
          title: 'Packages',
          description: 'Your published packages',
          setting: 'hidePackages'
        },
        {
          id: 'discussions',
          title: 'Discussions',
          description: 'GitHub Discussions activity',
          setting: 'hideDiscussions'
        },
        {
          id: 'projects',
          title: 'Projects',
          description: 'Project boards and notes',
          setting: 'hideProjects'
        }
      ]}
      settings={settings}
      onChange={onSettingChange}
    />

    {/* Settings Management */}
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Settings Management
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Export or import your customization settings
        </p>
      </div>
      <ExportImport
        onExport={onExport}
        onImport={onImport}
      />
    </div>
  </div>
)

export default SettingsTab;