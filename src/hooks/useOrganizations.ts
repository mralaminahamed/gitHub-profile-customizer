import { useQuery } from '@tanstack/react-query'
import type { Organization } from '@/types'
import React from 'react';

interface UseOrganizationsError {
  message: string
}

interface OrganizationResponse {
  organizations: Organization[]
  error?: string
}

const sendContentMessage = async (type: string, data?: any) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab.id) {
    throw new Error('No active tab found')
  }

  const response = await chrome.tabs.sendMessage(tab.id, { type, ...data })
  if (response?.error) {
    throw new Error(response.error)
  }
  return response
}

export function useOrganizations() {
  // Fetch organizations
  const {
    data: organizations = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Organization[], UseOrganizationsError>({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const response = await sendContentMessage('getOrganizations') as OrganizationResponse
        return response.organizations
      } catch (error) {
        throw {
          message: error instanceof Error
            ? error.message
            : 'Failed to fetch organizations'
        }
      }
    },
    initialData: [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  })

  // Sort organizations by name
  const sortedOrganizations = React.useMemo(() => {
    return [...organizations].sort((a, b) => a.name.localeCompare(b.name))
  }, [organizations])

  // Search organizations by name
  const searchOrganizations = React.useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return sortedOrganizations

    const normalizedSearch = searchTerm.toLowerCase().trim()
    return sortedOrganizations.filter(org =>
      org.name.toLowerCase().includes(normalizedSearch)
    )
  }, [sortedOrganizations])

  // Refresh organizations list
  const refreshOrganizations = React.useCallback(async () => {
    try {
      await refetch()
    } catch (error) {
      console.error('Failed to refresh organizations:', error)
      throw error
    }
  }, [refetch])

  // Check if an organization exists
  const hasOrganization = React.useCallback((name: string) => {
    return organizations.some(org => org.name === name)
  }, [organizations])

  return {
    // Data
    organizations: sortedOrganizations,
    totalOrganizations: organizations.length,

    // Status
    isLoading,
    error: error?.message,

    // Actions
    refreshOrganizations,
    searchOrganizations,

    // Helpers
    hasOrganization,
  }
}

// Export types for external use
export type UseOrganizationsReturn = ReturnType<typeof useOrganizations>
export type OrganizationsError = UseOrganizationsError

// Custom hook for search functionality
export function useOrganizationSearch(defaultTerm = '') {
  const [searchTerm, setSearchTerm] = React.useState(defaultTerm)
  const { organizations, searchOrganizations } = useOrganizations()

  const filteredOrganizations = React.useMemo(() =>
      searchOrganizations(searchTerm),
    [searchTerm, searchOrganizations]
  )

  const searchResults = React.useMemo(() => ({
    organizations: filteredOrganizations,
    total: organizations.length,
    filtered: filteredOrganizations.length,
    hasResults: filteredOrganizations.length > 0,
    isFiltered: searchTerm.length > 0,
  }), [filteredOrganizations, organizations.length, searchTerm])

  return {
    searchTerm,
    setSearchTerm,
    ...searchResults,
  }
}

// Custom hook for organization selection
export function useOrganizationSelection() {
  const [selectedOrgs, setSelectedOrgs] = React.useState<Set<string>>(new Set())

  const toggleSelection = React.useCallback((orgName: string) => {
    setSelectedOrgs(current => {
      const updated = new Set(current)
      if (updated.has(orgName)) {
        updated.delete(orgName)
      } else {
        updated.add(orgName)
      }
      return updated
    })
  }, [])

  const selectAll = React.useCallback((orgs: Organization[]) => {
    setSelectedOrgs(new Set(orgs.map(org => org.name)))
  }, [])

  const clearSelection = React.useCallback(() => {
    setSelectedOrgs(new Set())
  }, [])

  return {
    selectedOrgs,
    isSelected: (orgName: string) => selectedOrgs.has(orgName),
    toggleSelection,
    selectAll,
    clearSelection,
    selectionCount: selectedOrgs.size,
    hasSelection: selectedOrgs.size > 0,
  }
}