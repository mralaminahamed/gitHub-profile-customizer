// types/index.ts

// Settings Interface
export interface Settings {
  // Profile Features
  hideActivity: boolean
  hideRepositories: boolean
  hideContributions: boolean
  hideAllOrgs: boolean
  hiddenOrgs: string[]
  hideSponsors: boolean
  hideAchievements: boolean

  // Repository Settings
  hidePinnedRepos: boolean
  hidePopularRepos: boolean
  hideLanguageStats: boolean
  hideContributorsSection: boolean
  hideRepoDescription: boolean

  // Activity Settings
  hideActivityGraph: boolean
  hideActivityOverview: boolean
  hideContributionStreak: boolean
  hidePrivateContributions: boolean

  // Profile Info
  hideStatus: boolean
  hideFollowers: boolean
  hideFollowing: boolean
  hideLocation: boolean
  hideBio: boolean
  hideEmail: boolean
  hideCompany: boolean
  hideWebsite: boolean
  hideTwitter: boolean

  // Theme Settings
  enableDarkMode: boolean
  customAccentColor: string | null
  compactMode: boolean

  // Additional Features
  hideReadme: boolean
  hidePackages: boolean
  hideHighlights: boolean
  hideDiscussions: boolean
  hideProjects: boolean

  // Organization Preferences
  orgViewMode: 'grid' | 'list'
  orgSortOrder: 'name' | 'recent' | 'hidden'
  orgGrouping: 'none' | 'type' | 'visibility'
}

// Organization Types
export type OrganizationType = 'personal' | 'business' | 'opensource' | 'other'
export type OrgVisibilityFilter = 'all' | 'visible' | 'hidden'
export type OrgSortOrder = 'name' | 'recent' | 'hidden'
export type OrgViewMode = 'grid' | 'list'
export type OrgGrouping = 'none' | 'type' | 'visibility'

export interface Organization {
  name: string
  avatar: string
  url: string
  type: OrganizationType
  isAdmin: boolean
  memberCount?: number
  repoCount?: number
  lastActive?: string
  isHidden?: boolean
  description?: string
  location?: string
}

export interface OrganizationStats {
  total: number
  visible: number
  hidden: number
  byType: {
    personal: number
    business: number
    opensource: number
    other: number
  }
}

export interface OrganizationFilters {
  searchTerm?: string
  type?: OrganizationType
  visibility?: OrgVisibilityFilter
  sortOrder?: OrgSortOrder
}

// Theme Interface
export interface Theme {
  name: string
  accentColor: string
  background: string
  text: string
  border: string
}

// UI Component Types
export interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
}

export interface ProfileSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType
  setting: keyof Settings
}

export interface Tab {
  id: string
  name: string
  icon: React.ComponentType
  component: React.ComponentType
}

// Message Types
export type MessageType =
  | 'getOrganizations'
  | 'getOrganizationStats'
  | 'updateSettings'
  | 'getState'
  | 'resetSettings'
  | 'updateOrganizationVisibility'
  | 'batchUpdateOrganizationVisibility'
  | 'updateTheme'
  | 'toggleDarkMode'
  | 'toggleCompactMode'

export interface Message {
  type: MessageType
  settings?: Partial<Settings>
  organizationName?: string
  organizationNames?: string[]
  isHidden?: boolean
  theme?: Theme
  enabled?: boolean
}

// Response Types
export interface BaseResponse {
  success?: boolean
  error?: string
}

export interface OrganizationsResponse extends BaseResponse {
  organizations: Organization[]
}

export interface OrganizationStatsResponse extends BaseResponse {
  stats: OrganizationStats
}

export interface SettingsResponse extends BaseResponse {
  settings: Settings
  initialized: boolean
}

export interface ThemeResponse extends BaseResponse {
  theme: Theme
}

export type MessageResponse =
  | OrganizationsResponse
  | OrganizationStatsResponse
  | SettingsResponse
  | ThemeResponse
  | BaseResponse