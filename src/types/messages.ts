// src/types/messages.ts
import type { Settings } from './index'

// Message for getting organizations
export interface GetOrganizationsMessage {
  type: 'getOrganizations'
}

// Message for updating settings
export interface UpdateSettingsMessage {
  type: 'updateSettings'
  settings: Partial<Settings>
}

// Message for getting current state
export interface GetStateMessage {
  type: 'getState'
}

// Message for updating single organization visibility
export interface UpdateOrganizationVisibilityMessage {
  type: 'updateOrganizationVisibility'
  organizationName: string
  isHidden: boolean
}

// Message for batch updating organization visibility
export interface BatchUpdateOrganizationVisibilityMessage {
  type: 'batchUpdateOrganizationVisibility'
  organizationNames: string[]
  isHidden: boolean
}

// Message for resetting settings
export interface ResetSettingsMessage {
  type: 'resetSettings'
}

// Message response types
export interface SuccessResponse {
  success: true
}

export interface ErrorResponse {
  error: string
}

export interface OrganizationsResponse {
  organizations: Array<{
    name: string
    avatar: string
    url: string
    organizations: string[]
  }>
}

export interface StateResponse {
  initialized: boolean
  settings: Settings | null
}

// Union type for all possible messages
export type Message =
  | GetOrganizationsMessage
  | UpdateSettingsMessage
  | GetStateMessage
  | UpdateOrganizationVisibilityMessage
  | BatchUpdateOrganizationVisibilityMessage
  | ResetSettingsMessage

// Union type for all possible responses
export type MessageResponse =
  | (SuccessResponse & OrganizationsResponse)
  | (SuccessResponse & StateResponse)
  | SuccessResponse
  | ErrorResponse

// Helper function to create a message with type safety
export function createMessage<T extends Message['type']>(
  type: T,
  ...args: T extends keyof MessageTypeToArgs ? [MessageTypeToArgs[T]] : []
): Extract<Message, { type: T }> {
  if (args.length > 0) {
    return {
      type,
      ...args[0],
    } as Extract<Message, { type: T }>
  }
  return { type } as Extract<Message, { type: T }>
}

// Mapping of message types to their argument types
type MessageTypeToArgs = {
  updateSettings: { settings: Partial<Settings> }
  updateOrganizationVisibility: { organizationName: string; isHidden: boolean }
  batchUpdateOrganizationVisibility: { organizationNames: string[]; isHidden: boolean }
  getOrganizations: never
  getState: never
  resetSettings: never
}

// Example usage:
/*
const message1 = createMessage('getOrganizations')
const message2 = createMessage('updateSettings', { settings: { hideActivity: true } })
const message3 = createMessage('updateOrganizationVisibility', {
  organizationName: 'org1',
  isHidden: true,
})
*/

// Type guard functions
export function isSuccessResponse(response: MessageResponse): response is SuccessResponse {
  return 'success' in response && response.success
}

export function isErrorResponse(response: MessageResponse): response is ErrorResponse {
  return 'error' in response
}

export function isOrganizationsResponse(
  response: MessageResponse
): response is SuccessResponse & OrganizationsResponse {
  return 'organizations' in response
}

export function isStateResponse(
  response: MessageResponse
): response is SuccessResponse & StateResponse {
  return 'initialized' in response && 'settings' in response
}