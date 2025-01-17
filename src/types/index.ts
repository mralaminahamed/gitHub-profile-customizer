// types/index.ts
export interface Settings {
  hideActivity: boolean
  hideRepositories: boolean
  hideContributions: boolean
  hideAllOrgs: boolean
  hiddenOrgs: string[]
  hideSponsors: boolean
  hideAchievements: boolean
}

export interface Organization {
  name: string
  avatar: string
  url: string
}

export type MessageType =
  | 'getOrganizations'
  | 'updateSettings'
  | 'getState'
  | 'resetSettings'
  | 'updateOrganizationVisibility'
  | 'batchUpdateOrganizationVisibility'

export interface Message {
  type: MessageType
  settings?: Partial<Settings>
  organizationName?: string
  organizationNames?: string[]
  isHidden?: boolean
}

export interface MessageResponse {
  success?: boolean
  error?: string
  organizations?: Organization[]
  settings?: Settings
  initialized?: boolean
}