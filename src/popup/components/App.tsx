import React from 'react'
import { Switch } from '@headlessui/react'
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useSettings } from '@/hooks/useSettings'
import {
  useOrganizations,
  useOrganizationSearch,
  useOrganizationSelection
} from '@/hooks/useOrganizations'

export const App: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    isSaving
  } = useSettings()

  const { isLoading, error, refreshOrganizations } = useOrganizations()
  const {
    searchTerm,
    setSearchTerm,
    organizations: filteredOrgs,
    total,
    filtered,
    hasResults,
    isFiltered
  } = useOrganizationSearch()

  const {
    selectedOrgs,
    toggleSelection,
    clearSelection,
    hasSelection,
    selectionCount
  } = useOrganizationSelection()

  const [hasChanges, setHasChanges] = React.useState(false)

  // Handle settings changes
  const handleSettingChange = (key: keyof typeof settings) => (value: boolean) => {
    setHasChanges(true)
    updateSettings({ [key]: value })
  }

  // Handle organization visibility
  const handleBatchVisibility = async (hide: boolean) => {
    if (selectedOrgs.size === 0) return

    setHasChanges(true)
    const currentHidden = new Set(settings.hiddenOrgs)

    selectedOrgs.forEach(org => {
      if (hide) {
        currentHidden.add(org)
      } else {
        currentHidden.delete(org)
      }
    })

    await updateSettings({ hiddenOrgs: Array.from(currentHidden) })
    clearSelection()
  }

  // Handle reset
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings?')) {
      await resetSettings()
      setHasChanges(false)
      clearSelection()
    }
  }

  // Handle save
  const handleSave = async () => {
    if (hasChanges) {
      await updateSettings(settings)
      setHasChanges(false)
      clearSelection()
    }
  }

  return (
    <div className="w-96 min-h-screen bg-gray-50">
      <div className="p-4 bg-white rounded-lg shadow">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">
              GitHub Profile Customizer
            </h1>
            {hasChanges && (
              <ExclamationCircleIcon
                className="w-5 h-5 text-yellow-500"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="text-sm text-gray-500">
            Customize your GitHub profile view
          </p>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Profile Sections
            </h2>
            <div className="space-y-4">
              <SwitchItem
                title="Activity Overview"
                description="Hide contribution graph and activity"
                checked={settings.hideActivity}
                onChange={handleSettingChange('hideActivity')}
              />
              <SwitchItem
                title="Repositories"
                description="Hide pinned and popular repositories"
                checked={settings.hideRepositories}
                onChange={handleSettingChange('hideRepositories')}
              />
              <SwitchItem
                title="Contributions"
                description="Hide the contribution calendar"
                checked={settings.hideContributions}
                onChange={handleSettingChange('hideContributions')}
              />
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Organizations */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-900">
                  Organizations
                </h2>
                {isFiltered && (
                  <span className="text-xs text-gray-500">
                    {filtered} of {total}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => refreshOrganizations()}
                disabled={isLoading}
                className="inline-flex items-center p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <ArrowPathIcon
                  className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>

            <SwitchItem
              title="All Organizations"
              description="Hide the entire organizations section"
              checked={settings.hideAllOrgs}
              onChange={handleSettingChange('hideAllOrgs')}
            />

            {!settings.hideAllOrgs && (
              <>
                {/* Search and batch actions */}
                <div className="mt-3 space-y-2">
                  <div className="relative">
                    <MagnifyingGlassIcon
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search organizations..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>

                  {hasSelection && (
                    <div className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded-md">
                      <span className="text-xs text-gray-600">
                        {selectionCount} selected
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBatchVisibility(true)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Hide
                        </button>
                        <button
                          onClick={() => handleBatchVisibility(false)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Show
                        </button>
                        <button
                          onClick={clearSelection}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Organizations list */}
                <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-gray-200">
                  {hasResults ? (
                    filteredOrgs.map((org) => (
                      <div
                        key={org.name}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOrgs.has(org.name)}
                          onChange={() => toggleSelection(org.name)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <img
                          src={org.avatar}
                          alt={org.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="flex-1 text-sm text-gray-700">
                          {org.name}
                        </span>
                        <Switch
                          checked={settings.hiddenOrgs.includes(org.name)}
                          onChange={(checked) => {
                            setHasChanges(true)
                            const hiddenOrgs = new Set(settings.hiddenOrgs)
                            if (checked) {
                              hiddenOrgs.add(org.name)
                            } else {
                              hiddenOrgs.delete(org.name)
                            }
                            updateSettings({ hiddenOrgs: Array.from(hiddenOrgs) })
                          }}
                          className={`${
                            settings.hiddenOrgs.includes(org.name)
                              ? 'bg-blue-600'
                              : 'bg-gray-200'
                          } relative inline-flex h-5 w-9 items-center rounded-full`}
                        >
                          <span
                            className={`${
                              settings.hiddenOrgs.includes(org.name)
                                ? 'translate-x-5'
                                : 'translate-x-1'
                            } inline-block h-3 w-3 transform rounded-full bg-white transition`}
                          />
                        </Switch>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center p-4 text-sm text-gray-500">
                      {isFiltered ? 'No matching organizations' : 'No organizations found'}
                    </div>
                  )}
                </div>

                {error && (
                  <p className="mt-2 text-xs text-red-600">
                    {error}
                  </p>
                )}
              </>
            )}
          </section>

          <hr className="border-gray-200" />

          {/* Additional Settings */}
          <section>
            <h2 className="text-sm font-medium text-gray-900 mb-4">
              Additional Settings
            </h2>
            <div className="space-y-4">
              <SwitchItem
                title="Sponsors Section"
                description="Hide GitHub Sponsors section"
                checked={settings.hideSponsors}
                onChange={handleSettingChange('hideSponsors')}
              />
              <SwitchItem
                title="Achievements"
                description="Hide badges and achievements"
                checked={settings.hideAchievements}
                onChange={handleSettingChange('hideAchievements')}
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSaving}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowUturnLeftIcon className="w-4 h-4 mr-2" aria-hidden="true" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <CheckIcon className="w-4 h-4 mr-2" aria-hidden="true" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SwitchItemProps {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

const SwitchItem: React.FC<SwitchItemProps> = ({
                                                 title,
                                                 description,
                                                 checked,
                                                 onChange
                                               }) => (
  <Switch.Group as="div" className="flex items-center justify-between">
    <div className="flex-1 mr-4">
      <Switch.Label as="div" className="text-sm font-medium text-gray-900">
        {title}
      </Switch.Label>
      <Switch.Description as="div" className="text-xs text-gray-500">
        {description}
      </Switch.Description>
    </div>
    <Switch
      checked={checked}
      onChange={onChange}
      className={`${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </Switch>
  </Switch.Group>
)