import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import type { Organization, Settings, OrganizationType } from '@/types';
import { ErrorMessage, GroupingSelector, SearchInput, SortSelector, ViewControls, QuickActionButton } from '@/popup/components/Supporting';
import type { OrganizationFilters } from '@/hooks/useOrganizationSearch';

interface TabProps {
  settings: Settings;
  onSettingChange: (key: keyof Settings) => (value: any) => void;
}

interface OrganizationsTabProps extends TabProps {
  organizations: Organization[];
  stats: {
    total: number;
    visible: number;
    hidden: number;
    byType: Record<OrganizationType, number>;
  };
  isLoading: boolean;
  onRefresh: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: OrganizationFilters;
  onFilterChange: (key: keyof OrganizationFilters, value: any) => void;
  onUpdateVisibility: (orgName: string, isHidden: boolean) => Promise<void>;
  onBatchUpdateVisibility: (orgNames: string[], isHidden: boolean) => Promise<void>;
  error?: string;
}

const OrganizationsList: React.FC<{
  organizations: Organization[];
  viewMode: 'grid' | 'list';
  grouping: 'none' | 'type' | 'visibility';
  hiddenOrgs: string[];
  onToggleVisibility: (orgName: string, isHidden: boolean) => Promise<void>;
}> = ({ organizations, viewMode, grouping, hiddenOrgs, onToggleVisibility }) => {
  const groupedOrgs = React.useMemo(() => {
    if (grouping === 'none') {
      return { ungrouped: organizations };
    }

    return organizations.reduce((acc, org) => {
      const key = grouping === 'type' ? org.type : (hiddenOrgs.includes(org.name) ? 'hidden' : 'visible');
      if (!acc[key]) acc[key] = [];
      acc[key].push(org);
      return acc;
    }, {} as Record<string, Organization[]>);
  }, [organizations, grouping, hiddenOrgs]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedOrgs).map(([group, orgs]) => (
        <div key={group} className="space-y-2">
          {group !== 'ungrouped' && (
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {group}
            </h3>
          )}
          <div className={clsx(
            'gap-2',
            viewMode === 'grid' ? 'grid grid-cols-2' : 'space-y-2'
          )}>
            <AnimatePresence>
              {orgs.map((org) => (
                <motion.div
                  key={org.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  {viewMode === 'grid' ? (
                    <OrganizationCard
                      org={org}
                      isHidden={hiddenOrgs.includes(org.name)}
                      onToggleVisibility={onToggleVisibility}
                    />
                  ) : (
                    <OrganizationListItem
                      org={org}
                      isHidden={hiddenOrgs.includes(org.name)}
                      onToggleVisibility={onToggleVisibility}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};

const OrganizationCard: React.FC<{
  org: Organization;
  isHidden: boolean;
  onToggleVisibility: (orgName: string, isHidden: boolean) => Promise<void>;
}> = ({ org, isHidden, onToggleVisibility }) => (
  <div className={clsx(
    'p-4 rounded-xl border transition-all duration-200',
    'bg-white dark:bg-gray-800',
    'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
    isHidden ? 'border-gray-200 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-700'
  )}>
    <div className="flex flex-col items-center text-center space-y-3">
      <img
        src={org.avatar}
        alt={org.name}
        className="w-16 h-16 rounded-xl"
      />
      <div>
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {org.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {org.type} • {org.memberCount || 0} members
        </p>
      </div>
      <button
        onClick={() => onToggleVisibility(org.name, !isHidden)}
        className={clsx(
          'w-full px-3 py-1.5 rounded-lg text-sm font-medium',
          'transition-colors duration-200',
          isHidden
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
        )}
      >
        {isHidden ? 'Show Organization' : 'Hide Organization'}
      </button>
    </div>
  </div>
);

const OrganizationListItem: React.FC<{
  org: Organization;
  isHidden: boolean;
  onToggleVisibility: (orgName: string, isHidden: boolean) => Promise<void>;
}> = ({ org, isHidden, onToggleVisibility }) => (
  <div className={clsx(
    'flex items-center gap-3 p-3 rounded-lg',
    'bg-white dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'transition-all duration-200',
    isHidden && 'opacity-60'
  )}>
    <img
      src={org.avatar}
      alt={org.name}
      className="w-10 h-10 rounded-lg"
    />
    <div className="flex-1 min-w-0">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
        {org.name}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {org.type} • Last active {org.lastActive}
      </p>
    </div>
    <div className="flex items-center gap-2">
      {org.isAdmin && (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Admin
        </span>
      )}
      <button
        onClick={() => onToggleVisibility(org.name, !isHidden)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-lg transition-colors duration-200"
      >
        {isHidden ? (
          <EyeIcon className="w-5 h-5" />
        ) : (
          <EyeSlashIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
);

// @ts-ignore
const OrganizationsTab: React.FC<OrganizationsTabProps> = ({ settings, organizations, stats, isLoading, onRefresh, searchTerm, onSearchChange, filters, onFilterChange, onUpdateVisibility, onBatchUpdateVisibility, error, onSettingChange, }) => {
  // Quick actions for batch operations
  const handleBatchOperation = (operation: 'hideAll' | 'showAll') => {
    const orgNames = organizations.map(org => org.name);
    onBatchUpdateVisibility(orgNames, operation === 'hideAll');
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Organizations
          </h2>
          <span className="text-xs text-gray-500">
            {stats.visible} visible / {stats.total} total
          </span>
        </div>
        <ViewControls
          viewMode={filters.viewMode || 'grid'}
          onViewChange={(mode) => onFilterChange('viewMode', mode)}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <QuickActionButton
          icon={EyeSlashIcon}
          label="Hide All"
          onClick={() => handleBatchOperation('hideAll')}
        />
        <QuickActionButton
          icon={EyeIcon}
          label="Show All"
          onClick={() => handleBatchOperation('showAll')}
        />
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search organizations..."
        />
        <div className="flex gap-2">
          <SortSelector
            value={filters.sortOrder || 'name'}
            onChange={(order) => onFilterChange('sortOrder', order)}
          />
          <GroupingSelector
            value={filters.grouping || 'none'}
            onChange={(grouping) => onFilterChange('grouping', grouping)}
          />
        </div>
      </div>

      {/* Organizations List/Grid */}
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <OrganizationsList
          organizations={organizations}
          viewMode={filters.viewMode || 'grid'}
          grouping={filters.grouping || 'none'}
          hiddenOrgs={settings.hiddenOrgs}
          onToggleVisibility={onUpdateVisibility}
        />
      )}
    </div>
  );
};

export default OrganizationsTab;