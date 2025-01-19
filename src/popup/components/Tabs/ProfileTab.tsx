import React from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { TabProps } from '@/types';
import { PROFILE_SECTIONS } from '@/constants';
import { SettingsGroup, QuickActionButton } from '@/popup/components/Supporting';

export const ProfileTab: React.FC<TabProps> = ({ settings, onSettingChange }) => {
  // Split sections into categories for better organization
  const sections = React.useMemo(() => ({
    profile: PROFILE_SECTIONS.filter(section =>
      ['status', 'bio', 'location', 'company'].includes(section.id)
    ),
    contact: PROFILE_SECTIONS.filter(section =>
      ['email', 'website', 'twitter'].includes(section.id)
    ),
    repositories: PROFILE_SECTIONS.filter(section =>
      ['pinnedRepos', 'popularRepos', 'languageStats', 'contributorsSection'].includes(section.id)
    ),
    additional: PROFILE_SECTIONS.filter(section =>
      ['readme', 'packages', 'discussions', 'projects'].includes(section.id)
    )
  }), []);

  // Handle bulk actions
  const handleBulkAction = React.useCallback((action: 'hideAll' | 'showAll', sectionIds: string[]) => {
    const relevantSections = PROFILE_SECTIONS.filter(section =>
      sectionIds.includes(section.id)
    );

    relevantSections.forEach(section => {
      onSettingChange(section.setting)(action === 'hideAll');
    });
  }, [onSettingChange]);

  // Get visibility stats
  const stats = React.useMemo(() => {
    const allSections = Object.values(sections).flat();
    const hiddenCount = allSections.filter(section =>
      settings[section.setting]
    ).length;

    return {
      total: allSections.length,
      hidden: hiddenCount,
      visible: allSections.length - hiddenCount
    };
  }, [sections, settings]);

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Profile Sections
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {stats.visible} visible, {stats.hidden} hidden
          </p>
        </div>
        <div className="flex gap-2">
          <QuickActionButton
            icon={EyeSlashIcon}
            label="Hide All"
            onClick={() => handleBulkAction('hideAll', PROFILE_SECTIONS.map(s => s.id))}
          />
          <QuickActionButton
            icon={EyeIcon}
            label="Show All"
            onClick={() => handleBulkAction('showAll', PROFILE_SECTIONS.map(s => s.id))}
          />
        </div>
      </div>

      {/* Profile Information */}
      <SettingsGroup
        title="Profile Information"
        description="Control visibility of basic profile information"
        items={sections.profile.map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          setting: section.setting
        }))}
        settings={settings}
        onChange={onSettingChange}
      />

      {/* Contact Information */}
      <SettingsGroup
        title="Contact Information"
        description="Manage visibility of contact details"
        items={sections.contact.map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          setting: section.setting
        }))}
        settings={settings}
        onChange={onSettingChange}
      />

      {/* Repository Information */}
      <SettingsGroup
        title="Repository Information"
        description="Configure repository visibility and stats"
        items={sections.repositories.map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          setting: section.setting
        }))}
        settings={settings}
        onChange={onSettingChange}
      >
        <div className="flex gap-2 mt-4">
          <QuickActionButton
            icon={EyeSlashIcon}
            label="Hide All Repos"
            onClick={() => handleBulkAction('hideAll', sections.repositories.map(s => s.id))}
          />
          <QuickActionButton
            icon={EyeIcon}
            label="Show All Repos"
            onClick={() => handleBulkAction('showAll', sections.repositories.map(s => s.id))}
          />
        </div>
      </SettingsGroup>

      {/* Additional Features */}
      <SettingsGroup
        title="Additional Features"
        description="Toggle visibility of extra profile sections"
        items={sections.additional.map(section => ({
          id: section.id,
          title: section.title,
          description: section.description,
          setting: section.setting
        }))}
        settings={settings}
        onChange={onSettingChange}
      />
    </div>
  );
};

export default ProfileTab;