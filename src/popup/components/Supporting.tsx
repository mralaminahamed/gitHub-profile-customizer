import React from 'react'
import { Menu, Switch } from '@headlessui/react';
import {
  Squares2X2Icon as ViewGridIcon,  // Changed from ViewGridIcon
  ListBulletIcon as ViewListIcon,   // Changed from ViewListIcon
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx'
import type { Settings } from '@/types'

interface SwitchItemProps {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const SwitchItem: React.FC<SwitchItemProps> = ({ title, description, checked, onChange }) => (
  <Switch.Group>
    <div className="flex items-center justify-between">
      <div className="flex-grow">
        <Switch.Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </Switch.Label>
        <Switch.Description className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </Switch.Description>
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        className={clsx(
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full',
          'border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
        )}
      >
        <span
          className={clsx(
            checked ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none relative inline-block h-5 w-5 transform rounded-full',
            'bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
    </div>
  </Switch.Group>
)

interface SettingsGroupProps {
  title: string
  description?: string
  items: Array<{
    id: string
    title: string
    description: string
    setting: keyof Settings
  }>
  settings: Settings
  onChange: (key: keyof Settings) => (value: any) => void
  children?: React.ReactNode
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({ title, description, items, settings, onChange, children }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
    {children}
    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
      {items.map((item) => (
        <SwitchItem
          key={item.id}
          title={item.title}
          description={item.description}
          checked={settings[item.setting] as boolean}
          onChange={onChange(item.setting)}
        />
      ))}
    </div>
  </div>
)

interface ViewControlsProps {
  viewMode: 'grid' | 'list'
  onViewChange: (mode: 'grid' | 'list') => void
  onRefresh: () => void
  isLoading: boolean
}

export const ViewControls: React.FC<ViewControlsProps> = ({ viewMode, onViewChange, onRefresh, isLoading }) => (
  <div className="flex items-center gap-2">
    <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <ViewModeButton
        mode="grid"
        isActive={viewMode === 'grid'}
        onClick={() => onViewChange('grid')}
      />
      <ViewModeButton
        mode="list"
        isActive={viewMode === 'list'}
        onClick={() => onViewChange('list')}
      />
    </div>
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400
        dark:hover:text-gray-300 rounded-lg transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ArrowPathIcon
        className={clsx(
          "w-5 h-5",
          isLoading && "animate-spin"
        )}
      />
    </button>
  </div>
)

interface ViewModeButtonProps {
  mode: 'grid' | 'list'
  isActive: boolean
  onClick: () => void
}

const ViewModeButton: React.FC<ViewModeButtonProps> = ({ mode, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      'p-2 transition-colors duration-200',
      isActive
        ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
    )}
  >
    {mode === 'grid' ? (
      <ViewGridIcon className="w-5 h-5" />
    ) : (
      <ViewListIcon className="w-5 h-5" />
    )}
  </button>
)

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 pl-9 text-sm bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-blue-500
        placeholder-gray-400 dark:placeholder-gray-500"
      data-search-input
    />
    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2
      text-gray-400 dark:text-gray-500" />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-2 top-1/2 transform -translate-y-1/2
          text-gray-400 hover:text-gray-600 dark:text-gray-500
          dark:hover:text-gray-300"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    )}
  </div>
)

interface ErrorMessageProps {
  message: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50
    dark:text-red-400 dark:bg-red-900/30 rounded-lg">
    <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
    <p>{message}</p>
  </div>
)

interface SortSelectorProps {
  value: string
  onChange: (value: string) => void
}

export const SortSelector: React.FC<SortSelectorProps> = ({ value, onChange }) => (
  <Menu as="div" className="relative">
    <Menu.Button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700
      dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200
      dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
      transition-colors duration-200">
      <AdjustmentsHorizontalIcon className="w-4 h-4" />
      Sort
      <ChevronDownIcon className="w-4 h-4" />
    </Menu.Button>
    <Menu.Items className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800
      rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
      focus:outline-none z-10">
      {[
        { value: 'name', label: 'Name' },
        { value: 'recent', label: 'Recently Active' },
        { value: 'hidden', label: 'Hidden First' }
      ].map((option) => (
        <Menu.Item key={option.value}>
          {({ active }) => (
            <button
              className={clsx(
                'w-full text-left px-3 py-2 text-sm flex items-center',
                active && 'bg-gray-50 dark:bg-gray-700',
                value === option.value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              )}
              onClick={() => onChange(option.value)}
            >
              {value === option.value && (
                <CheckIcon className="w-4 h-4 mr-2" />
              )}
              {option.label}
            </button>
          )}
        </Menu.Item>
      ))}
    </Menu.Items>
  </Menu>
)

interface GroupingSelectorProps {
  value: 'none' | 'type' | 'visibility'
  onChange: (value: 'none' | 'type' | 'visibility') => void
}

export const GroupingSelector: React.FC<GroupingSelectorProps> = ({ value, onChange }) => (
  <Menu as="div" className="relative">
    <Menu.Button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700
      dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200
      dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
      transition-colors duration-200">
      <ViewGridIcon className="w-4 h-4" />
      Group
      <ChevronDownIcon className="w-4 h-4" />
    </Menu.Button>
    <Menu.Items className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800
      rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
      focus:outline-none z-10">
      {[
        { value: 'none', label: 'None' },
        { value: 'type', label: 'By Type' },
        { value: 'visibility', label: 'By Visibility' }
      ].map((option) => (
        <Menu.Item key={option.value}>
          {({ active }) => (
            <button
              className={clsx(
                'w-full text-left px-3 py-2 text-sm flex items-center',
                active && 'bg-gray-50 dark:bg-gray-700',
                value === option.value
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300'
              )}
              onClick={() => onChange(option.value as 'none' | 'type' | 'visibility')}
            >
              {value === option.value && (
                <CheckIcon className="w-4 h-4 mr-2" />
              )}
              {option.label}
            </button>
          )}
        </Menu.Item>
      ))}
    </Menu.Items>
  </Menu>
)

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
      bg-white dark:bg-gray-800 rounded-lg border border-gray-200
      dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700
      text-gray-700 dark:text-gray-300 transition-colors duration-200"
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
)

export interface RadioGroupOptionProps {
  value: string
  label: string
  description?: string
}

// @ts-ignore
export const RadioGroupOption: React.FC<RadioGroupOptionProps & { checked: boolean }> = ({ value, label, description, checked }) => (
  <div className={clsx(
    'relative flex items-start p-4 cursor-pointer rounded-lg transition-colors duration-200',
    checked
      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700',
    'border-2'
  )}>
    <div className="min-w-0 flex-1">
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </div>
      {description && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </div>
      )}
    </div>
    <div className={clsx(
      'w-5 h-5 rounded-full border-2 transition-colors duration-200 flex-shrink-0',
      checked
        ? 'border-blue-600 bg-blue-600 dark:border-blue-400 dark:bg-blue-400'
        : 'border-gray-300 dark:border-gray-600'
    )}>
      {checked && (
        <div className="w-1.5 h-1.5 rounded-full bg-white mx-auto mt-1.5" />
      )}
    </div>
  </div>
)
