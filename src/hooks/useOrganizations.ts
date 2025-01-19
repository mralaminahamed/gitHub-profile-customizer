import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Organization, OrganizationStats } from '@/types';
import type { UseQueryOptions } from '@tanstack/react-query';
import { sendMessage, isOrganizationsResponse, isOrganizationStatsResponse } from '@/types/messages';
import React from 'react';

interface OrganizationState {
  organizations: Organization[];
  stats: OrganizationStats;
}

interface UseOrganizationsFilters {
  searchTerm?: string;
  type?: Organization['type'];
  visibility?: 'all' | 'visible' | 'hidden';
}

// Define the query key type
const organizationsQueryKey = ['organizations'] as const;
type OrganizationsQueryKey = typeof organizationsQueryKey;

export function useOrganizations(
  options?: Omit<UseQueryOptions<OrganizationState, Error, OrganizationState, OrganizationsQueryKey>, 'queryKey' | 'queryFn'>
) {
  const queryClient = useQueryClient();

  // Fetch organizations and stats
  const { data, isLoading, error, refetch } = useQuery<OrganizationState, Error, OrganizationState, OrganizationsQueryKey>({
    queryKey: organizationsQueryKey,
    queryFn: async (): Promise<OrganizationState> => {
      try {
        const [orgsResponse, statsResponse] = await Promise.all([
          sendMessage({ type: 'getOrganizations' }),
          sendMessage({ type: 'getOrganizationStats' })
        ]);

        if (!isOrganizationsResponse(orgsResponse)) {
          throw new Error(orgsResponse.error || 'Failed to fetch organizations');
        }

        if (!isOrganizationStatsResponse(statsResponse)) {
          throw new Error(statsResponse.error || 'Failed to fetch organization stats');
        }

        // Count organizations by type
        const byType = orgsResponse.organizations.reduce((acc, org) => {
          acc[org.type] = (acc[org.type] || 0) + 1;
          return acc;
        }, {
          personal: 0,
          business: 0,
          opensource: 0,
          other: 0
        } as Record<Organization['type'], number>);

        return {
          organizations: orgsResponse.organizations,
          stats: {
            ...statsResponse.stats,
            byType
          }
        };
      } catch (error) {
        throw new Error(
          error instanceof Error ? error.message : 'Failed to fetch organizations'
        );
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...options
  });

  // Sort organizations by name and type
  const sortedOrganizations = React.useMemo(() => {
    return [...(data?.organizations || [])].sort((a, b) => {
      // First by type
      if (a.type !== b.type) {
        const typeOrder = { personal: 0, business: 1, opensource: 2, other: 3 };
        return typeOrder[a.type] - typeOrder[b.type];
      }
      // Then by name
      return a.name.localeCompare(b.name);
    });
  }, [data?.organizations]);

  // Filter organizations
  const filterOrganizations = React.useCallback((organizations: Organization[], filters: UseOrganizationsFilters) => {
    return organizations.filter(org => {
      // Search term filter
      if (filters.searchTerm) {
        const normalizedSearch = filters.searchTerm.toLowerCase().trim();
        if (!org.name.toLowerCase().includes(normalizedSearch)) {
          return false;
        }
      }

      // Type filter
      if (filters.type && org.type !== filters.type) {
        return false;
      }

      // Visibility filter
      if (filters.visibility === 'hidden' && !org.isHidden) return false;
      if (filters.visibility === 'visible' && org.isHidden) return false;

      return true;
    });
  }, []);

  // Update organization visibility
  const updateOrganizationVisibility = React.useCallback(async (organizationName: string, isHidden: boolean) => {
    try {
      const response = await sendMessage({
        type: 'updateOrganizationVisibility',
        organizationName,
        isHidden
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: organizationsQueryKey });
    } catch (error) {
      console.error('Failed to update organization visibility:', error);
      throw error;
    }
  }, [queryClient]);

  // Batch update organization visibility
  const batchUpdateOrganizationVisibility = React.useCallback(async (organizationNames: string[], isHidden: boolean) => {
    try {
      const response = await sendMessage({
        type: 'batchUpdateOrganizationVisibility',
        organizationNames,
        isHidden
      });

      if ('error' in response) {
        throw new Error(response.error);
      }

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: organizationsQueryKey });
    } catch (error) {
      console.error('Failed to batch update organization visibility:', error);
      throw error;
    }
  }, [queryClient]);

  console.log('error?.message', error?.message)

  return {
    // Data
    organizations: sortedOrganizations,
    stats: data?.stats,

    // Status
    isLoading,
    error: error?.message,

    // Actions
    refreshOrganizations: refetch,
    filterOrganizations,
    updateOrganizationVisibility,
    batchUpdateOrganizationVisibility,
  };
}