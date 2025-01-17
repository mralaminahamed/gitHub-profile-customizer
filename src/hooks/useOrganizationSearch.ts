import React from 'react';
import type { Organization, OrganizationType, OrgSortOrder, OrgViewMode, OrgGrouping } from '@/types';

export interface OrganizationFilters {
  type?: OrganizationType;
  visibility?: 'all' | 'visible' | 'hidden';
  sortOrder?: OrgSortOrder;
  viewMode?: OrgViewMode;
  grouping?: OrgGrouping;
}

interface UseOrganizationSearchProps {
  organizations: Organization[];
  defaultFilters?: Partial<OrganizationFilters>;
}

interface UseOrganizationSearchReturn {
  // Search state
  searchTerm: string;
  filters: OrganizationFilters;

  // Actions
  setSearchTerm: (term: string) => void;
  setFilter: (key: keyof OrganizationFilters, value: any) => void;
  resetFilters: () => void;

  // Results
  filteredOrganizations: Organization[];
  totalCount: number;
  filteredCount: number;
  hasResults: boolean;
  isFiltered: boolean;

  // Stats
  visibleCount: number;
  hiddenCount: number;
  typeStats: Record<OrganizationType, number>;
}

const defaultFilters: OrganizationFilters = {
  visibility: 'all',
  sortOrder: 'name',
  viewMode: 'grid',
  grouping: 'none'
};

export function useOrganizationSearch({ organizations, defaultFilters: initialFilters = {} }: UseOrganizationSearchProps): UseOrganizationSearchReturn {
  // State
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filters, setFilters] = React.useState<OrganizationFilters>({
    ...defaultFilters,
    ...initialFilters
  });

  // Filter organizations based on search term and filters
  const filteredOrganizations = React.useMemo(() => {
    let filtered = [...organizations];

    // Apply text search
    if (searchTerm.trim()) {
      const searchRegex = new RegExp(searchTerm.trim(), 'i');
      filtered = filtered.filter(org =>
        searchRegex.test(org.name) ||
        searchRegex.test(org.description || '') ||
        searchRegex.test(org.type)
      );
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(org => org.type === filters.type);
    }

    // Apply visibility filter
    if (filters.visibility !== 'all') {
      filtered = filtered.filter(org =>
        filters.visibility === 'hidden' ? org.isHidden : !org.isHidden
      );
    }

    // Apply sorting
    if (filters.sortOrder) {
      filtered.sort((a, b) => {
        switch (filters.sortOrder) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'recent':
            // If lastActive is undefined, treat it as oldest
            if (!a.lastActive) return 1;
            if (!b.lastActive) return -1;
            return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
          case 'hidden':
            // Sort hidden items first, then by name
            if (a.isHidden === b.isHidden) {
              return a.name.localeCompare(b.name);
            }
            return a.isHidden ? -1 : 1;
          default:
            return 0;
        }
      });
    }

    return filtered;
  }, [organizations, searchTerm, filters]);

  // Calculate stats
  const stats = React.useMemo(() => {
    const visibleCount = organizations.filter(org => !org.isHidden).length;
    const hiddenCount = organizations.length - visibleCount;

    // Count organizations by type
    const typeStats = organizations.reduce((acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1;
      return acc;
    }, {} as Record<OrganizationType, number>);

    return {
      visibleCount,
      hiddenCount,
      typeStats
    };
  }, [organizations]);

  // Set individual filter value
  const setFilter = React.useCallback((key: keyof OrganizationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Reset all filters to default
  const resetFilters = React.useCallback(() => {
    setFilters(defaultFilters);
    setSearchTerm('');
  }, []);

  // Check if any filters are active
  const isFiltered = React.useMemo(() =>
      Boolean(
        searchTerm ||
        filters.type ||
        filters.visibility !== 'all' ||
        filters.sortOrder !== 'name'
      )
    , [searchTerm, filters]);

  return {
    // Search state
    searchTerm,
    filters,

    // Actions
    setSearchTerm,
    setFilter,
    resetFilters,

    // Results
    filteredOrganizations,
    totalCount: organizations.length,
    filteredCount: filteredOrganizations.length,
    hasResults: filteredOrganizations.length > 0,
    isFiltered,

    // Stats
    visibleCount: stats.visibleCount,
    hiddenCount: stats.hiddenCount,
    typeStats: stats.typeStats
  };
}