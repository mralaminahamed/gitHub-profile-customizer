import React from 'react';
import type { Settings } from '@/types';
import { SettingsGroup } from '@/popup/components/Supporting';

interface TabProps {
  settings: Settings;
  onSettingChange: (key: keyof Settings) => (value: any) => void;
}

const ActivityTab: React.FC<TabProps> = ({ settings, onSettingChange }) => (
  <div className="space-y-8">
    {/* Activity Overview */}
    <SettingsGroup
      title="Activity Graph"
      description="Customize your contribution display"
      items={[
        {
          id: 'activityGraph',
          title: 'Contribution Graph',
          description: 'Your activity heatmap',
          setting: 'hideActivityGraph'
        },
        {
          id: 'activityStreak',
          title: 'Contribution Streak',
          description: 'Your daily contribution streak',
          setting: 'hideContributionStreak'
        },
        {
          id: 'privateContributions',
          title: 'Private Contributions',
          description: 'Contributions to private repositories',
          setting: 'hidePrivateContributions'
        }
      ]}
      settings={settings}
      onChange={onSettingChange}
    />

    {/* Activity Details */}
    <SettingsGroup
      title="Activity Details"
      description="Configure activity information display"
      items={[
        {
          id: 'activityOverview',
          title: 'Activity Overview',
          description: 'Summary of your recent activity',
          setting: 'hideActivityOverview'
        },
        {
          id: 'highlights',
          title: 'Highlights',
          description: 'Notable contributions and achievements',
          setting: 'hideHighlights'
        },
        {
          id: 'sponsorships',
          title: 'Sponsorships',
          description: 'GitHub Sponsors information',
          setting: 'hideSponsors'
        },
        {
          id: 'achievements',
          title: 'Achievements',
          description: 'GitHub Achievements and badges',
          setting: 'hideAchievements'
        }
      ]}
      settings={settings}
      onChange={onSettingChange}
    />
  </div>
)

export default ActivityTab;
