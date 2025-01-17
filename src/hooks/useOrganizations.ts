// src/hooks/useOrganizations.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Organization } from '@/types';

interface UseOrganizationsError {
  message: string;
  code: string;
}

interface OrganizationResponse {
  organizations: Organization[];
  error?: string;
}

interface UpdateOrganizationVisibility {
  organizationName: string;
  isHidden: boolean;
}

export function useOrganizations() {
  const queryClient = useQueryClient();

  // Fetch organizations
  const {
    data: organizations = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Organization[], UseOrganizationsError>({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
          throw new Error('No active tab found');
        }

        const response = await chrome.tabs.sendMessage<any, OrganizationResponse>(
          tab.id,
          { type: 'getOrganizations' },
        );

        if (response.error) {
          throw new Error(response.error);
        }

        return response.organizations;
      } catch (error) {
        if (error instanceof Error) {
          throw {
            message: error.message,
            code: 'FETCH_ERROR',
          };
        }
        throw {
          message: 'Failed to fetch organizations',
          code: 'UNKNOWN_ERROR',
        };
      }
    },
    initialData: [],
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update organization visibility
  const updateVisibility = useMutation<void, UseOrganizationsError, UpdateOrganizationVisibility>({
    mutationFn: async ({ organizationName, isHidden }) => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
          throw new Error('No active tab found');
        }

        const response = await chrome.tabs.sendMessage(tab.id, {
          type: 'updateOrganizationVisibility',
          organizationName,
          isHidden,
        });

        if (response.error) {
          throw new Error(response.error);
        }
      } catch (error) {
        if (error instanceof Error) {
          throw {
            message: error.message,
            code: 'UPDATE_ERROR',
          };
        }
        throw {
          message: 'Failed to update organization visibility',
          code: 'UNKNOWN_ERROR',
        };
      }
    },
    onSuccess: () => {
      // Invalidate and refetch organizations after successful update
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  // Batch update organizations visibility
  const batchUpdateVisibility = useMutation<void, UseOrganizationsError, {
    organizationNames: string[],
    isHidden: boolean
  }>({
    mutationFn: async ({ organizationNames, isHidden }) => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab.id) {
          throw new Error('No active tab found');
        }

        const response = await chrome.tabs.sendMessage(tab.id, {
          type: 'batchUpdateOrganizationVisibility',
          organizationNames,
          isHidden,
        });

        if (response.error) {
          throw new Error(response.error);
        }
      } catch (error) {
        if (error instanceof Error) {
          throw {
            message: error.message,
            code: 'BATCH_UPDATE_ERROR',
          };
        }
        throw {
          message: 'Failed to batch update organizations',
          code: 'UNKNOWN_ERROR',
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });

  // Filter organizations by name
  const filterOrganizations = (searchTerm: string) => {
    if (!searchTerm) return organizations;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return organizations.filter(org =>
      org.name.toLowerCase().includes(lowerSearchTerm),
    );
  };

  // Sort organizations by name
  const sortOrganizations = (orgs: Organization[]) => {
    return [...orgs].sort((a, b) => a.name.localeCompare(b.name));
  };

  // Check if an organization exists
  const organizationExists = (name: string) => {
    return organizations.some(org => org.name === name);
  };

  return {
    // Data
    organizations,
    sortedOrganizations: sortOrganizations(organizations),

    // Status
    isLoading,
    isError,
    error,
    isFetching,

    // Actions
    refetch,
    updateVisibility,
    batchUpdateVisibility,

    // Utilities
    filterOrganizations,
    sortOrganizations,
    organizationExists,
  };
}

// Helper types for better type inference when using the hook
export type UseOrganizationsReturn = ReturnType<typeof useOrganizations>
export type OrganizationsError = UseOrganizationsError