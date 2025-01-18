import React from 'react';
import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { useSettings } from '@/hooks/useSettings';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrganizationSearch } from '@/hooks/useOrganizationSearch';
import { TABS, THEMES } from '@/constants';
import type { Theme, Settings } from '@/types';
import { ErrorAlert, KeyboardShortcutsModal, QuickActions } from '@/popup/components/QuickActions';
import ProfileTab from '@/popup/components/Tabs/ProfileTab';
import ActivityTab from '@/popup/components/Tabs/ActivityTab';
import OrganizationsTab from '@/popup/components/Tabs/OrganizationsTab';
import SettingsTab from '@/popup/components/Tabs/SettingsTab';
import { ActivityTabSkeleton, ProfileTabSkeleton, SettingsTabSkeleton } from '@/popup/components/AppSkeleton';
import ProfileCustomizerIcon from '@/popup/components/ProfileCustomizerIcon';

export const App: React.FC = () => {
  const { settings, updateSettings, resetSettings, isSaving, isLoading: isLoadingSettings, error: settingsError, theme, setTheme, exportSettings, importSettings } = useSettings();
  const { organizations, stats, isLoading: isLoadingOrgs, error: orgsError, refreshOrganizations, updateOrganizationVisibility, batchUpdateOrganizationVisibility } = useOrganizations();
  const { searchTerm, setSearchTerm, filters, setFilter, filteredOrganizations, resetFilters } = useOrganizationSearch({
    organizations,
    defaultFilters: {
      viewMode: settings.orgViewMode,
      sortOrder: settings.orgSortOrder,
      grouping: settings.orgGrouping
    }
  });

  const [selectedTab, setSelectedTab] = React.useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false);

  // Create curried version of handleSettingChange for compatibility
  const handleSettingChangeCurried = React.useCallback(
    (key: keyof Settings) => (value: any) => {
      updateSettings({ [key]: value });
    },
    [updateSettings]
  );

  // Keyboard shortcuts handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const keyMap: Record<string, () => void> = {
          's': () => { if (!isSaving) updateSettings(settings); },
          'r': handleReset,
          'f': () => document.querySelector<HTMLInputElement>('[data-search-input]')?.focus(),
          'd': () => handleThemeChange(settings.enableDarkMode ? THEMES[0] : THEMES[1]),
          'm': () => handleSettingChangeCurried('compactMode')(!settings.compactMode),
          'e': exportSettings,
          'i': () => document.querySelector<HTMLInputElement>('[data-import-input]')?.click()
        };

        const action = keyMap[e.key.toLowerCase()];
        if (action) {
          e.preventDefault();
          action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings, isSaving, updateSettings]);

  const handleThemeChange = React.useCallback(async (newTheme: Theme) => {
    try {
      await setTheme(newTheme);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  }, [setTheme]);

  const handleReset = React.useCallback(async () => {
    if (window.confirm('Reset all settings to default?')) {
      try {
        await resetSettings();
        resetFilters();
      } catch (error) {
        console.error('Failed to reset settings:', error);
      }
    }
  }, [resetSettings, resetFilters]);

  const handleImport = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      await importSettings(importedSettings);
    } catch (error) {
      console.error('Failed to import settings:', error);
    }

    // Reset input
    event.target.value = '';
  }, [importSettings]);

  // Render header with app title and quick actions
  const renderHeader = () => (
    <header className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <ProfileCustomizerIcon size={40}/>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Profile Customizer
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Personalize your GitHub presence
          </p>
        </div>
      </div>
      <QuickActions
        settings={settings}
        theme={theme}
        onThemeChange={handleThemeChange}
        onToggleKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
        onImport={handleImport}
        onExport={exportSettings}
      />
    </header>
  );

  return (
    <div className={clsx(
      'w-[450px] min-h-screen',
      'bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800',
      'transition-colors duration-200',
      settings.compactMode ? 'p-4' : 'p-6'
    )}>
      {renderHeader()}

      {/* Error Alert */}
      {(settingsError || orgsError) && (
        <ErrorAlert message={settingsError! || orgsError!} className="mb-4" />
      )}

      {/* Main Content */}
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800/50 p-1">
          {TABS.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) => clsx(
                'w-full py-2 text-sm font-medium rounded-lg flex items-center justify-center gap-2',
                'focus:outline-none transition-colors duration-200',
                selected
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          <Tab.Panel>
            {isLoadingSettings ? (
              <ProfileTabSkeleton />
            ) : (
              <ProfileTab
                settings={settings}
                onSettingChange={handleSettingChangeCurried}
              />
            )}
          </Tab.Panel>
          <Tab.Panel>
            {isLoadingSettings ? (
              <ActivityTabSkeleton />
            ) : (
              <ActivityTab
                settings={settings}
                onSettingChange={handleSettingChangeCurried}
              />
            )}
          </Tab.Panel>
          <Tab.Panel>
            {isLoadingSettings || isLoadingOrgs ? (
              <ActivityTabSkeleton />
            ) : (
              <OrganizationsTab
              settings={settings}
              organizations={filteredOrganizations}
              stats={stats!}
              isLoading={isLoadingOrgs}
              onRefresh={refreshOrganizations}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters!}
              onFilterChange={setFilter}
              onUpdateVisibility={updateOrganizationVisibility}
              onBatchUpdateVisibility={batchUpdateOrganizationVisibility}
              onSettingChange={handleSettingChangeCurried}
            />
            )}
          </Tab.Panel>
          <Tab.Panel>
            { isLoadingSettings ? (
              <SettingsTabSkeleton/>
              ) : (
              <SettingsTab
                settings={settings}
                onSettingChange={handleSettingChangeCurried}
                onThemeChange={handleThemeChange}
                onExport={exportSettings}
                onImport={importSettings}
                onReset={handleReset}
              />
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />
      )}
    </div>
  );
};

export default App;