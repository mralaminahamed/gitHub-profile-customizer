import type { Settings, Organization, Theme } from './index'

// Base message interface
interface BaseMessage {
  type: MessageType
}

// Message Types
export type MessageType =
  | 'getOrganizations'
  | 'updateSettings'
  | 'getState'
  | 'updateOrganizationVisibility'
  | 'batchUpdateOrganizationVisibility'
  | 'resetSettings'
  | 'updateTheme'
  | 'toggleDarkMode'
  | 'toggleCompactMode'
  | 'getOrganizationStats'

// Individual Message Interfaces
export interface GetOrganizationsMessage extends BaseMessage {
  type: 'getOrganizations'
}

export interface UpdateSettingsMessage extends BaseMessage {
  type: 'updateSettings'
  settings: Partial<Settings>
}

export interface GetStateMessage extends BaseMessage {
  type: 'getState'
}

export interface UpdateOrganizationVisibilityMessage extends BaseMessage {
  type: 'updateOrganizationVisibility'
  organizationName: string
  isHidden: boolean
}

export interface BatchUpdateOrganizationVisibilityMessage extends BaseMessage {
  type: 'batchUpdateOrganizationVisibility'
  organizationNames: string[]
  isHidden: boolean
}

export interface ResetSettingsMessage extends BaseMessage {
  type: 'resetSettings'
}

export interface UpdateThemeMessage extends BaseMessage {
  type: 'updateTheme'
  accentColor: string | null
}

export interface ToggleDarkModeMessage extends BaseMessage {
  type: 'toggleDarkMode'
  enabled?: boolean
}

export interface ToggleCompactModeMessage extends BaseMessage {
  type: 'toggleCompactMode'
  enabled?: boolean
}

export interface GetOrganizationStatsMessage extends BaseMessage {
  type: 'getOrganizationStats'
}

// Response Types
export interface BaseResponse {
  success?: boolean
  error?: string
}

export interface SuccessResponse extends BaseResponse {
  success: true
}

export interface ErrorResponse extends BaseResponse {
  error: string
}

export interface OrganizationsResponse extends SuccessResponse {
  organizations: Organization[]
}

export interface StateResponse extends SuccessResponse {
  initialized: boolean
  settings: Settings | null
}

export interface OrganizationStatsResponse extends SuccessResponse {
  stats: {
    total: number
    visible: number
    hidden: number
  }
}

export interface ThemeResponse extends SuccessResponse {
  theme: Theme
}

// Union type for all possible messages
export type Message =
  | GetOrganizationsMessage
  | UpdateSettingsMessage
  | GetStateMessage
  | UpdateOrganizationVisibilityMessage
  | BatchUpdateOrganizationVisibilityMessage
  | ResetSettingsMessage
  | UpdateThemeMessage
  | ToggleDarkModeMessage
  | ToggleCompactModeMessage
  | GetOrganizationStatsMessage

// Union type for all possible responses
export type MessageResponse =
  | OrganizationsResponse
  | StateResponse
  | OrganizationStatsResponse
  | ThemeResponse
  | SuccessResponse
  | ErrorResponse

// Helper function to create messages with type safety
export function createMessage<T extends MessageType>(
  type: T,
  args?: MessageArgs<T>
): MessageForType<T> {
  return {
    type,
    ...args,
  } as MessageForType<T>
}

// Type helpers for createMessage function
type MessageForType<T extends MessageType> = Extract<Message, { type: T }>

type MessageArgs<T extends MessageType> = Omit<MessageForType<T>, 'type'>

// Type guard functions
export function isSuccessResponse(response: MessageResponse): response is SuccessResponse {
  return 'success' in response && response.success === true
}

export function isErrorResponse(response: MessageResponse): response is ErrorResponse {
  return 'error' in response
}

export function isOrganizationsResponse(
  response: MessageResponse
): response is OrganizationsResponse {
  return 'organizations' in response
}

export function isStateResponse(
  response: MessageResponse
): response is StateResponse {
  return 'initialized' in response && 'settings' in response
}

export function isOrganizationStatsResponse(
  response: MessageResponse
): response is OrganizationStatsResponse {
  return 'stats' in response && isSuccessResponse(response)
}

export function isThemeResponse(
  response: MessageResponse
): response is ThemeResponse {
  return 'theme' in response && isSuccessResponse(response)
}

/**
 * Helper function to send messages to the content script
 */
export async function sendMessage<T extends Message>(
  message: T
): Promise<MessageResponse> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) {
      throw new Error('No active tab found')
    }

    return await chrome.tabs.sendMessage(tab.id, message)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to send message'
    }
  }
}

// Example usage:
/*
const getMessage = createMessage('getOrganizations')
const updateSettings = createMessage('updateSettings', { settings: { hideActivity: true } })
const updateVisibility = createMessage('updateOrganizationVisibility', {
  organizationName: 'org1',
  isHidden: true,
})
const updateTheme = createMessage('updateTheme', { accentColor: '#ff0000' })
const toggleDark = createMessage('toggleDarkMode', { enabled: true })
const getStats = createMessage('getOrganizationStats')

// Using sendMessage helper
const response = await sendMessage(createMessage('getOrganizations'))
if (isOrganizationsResponse(response)) {
  // Handle organizations
} else if (isErrorResponse(response)) {
  // Handle error
}
*/