import React from 'react';
import { Menu } from '@headlessui/react';
import {
  DocumentDuplicateIcon,
  ExclamationCircleIcon,
  KeyIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { KEYBOARD_SHORTCUTS, THEMES } from '@/constants';
import type { Settings, Theme } from '@/types';
import clsx from 'clsx';

interface QuickActionsProps {
  settings: Settings;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onToggleKeyboardShortcuts: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ settings, theme, onThemeChange, onToggleKeyboardShortcuts, onImport, onExport }) => (
  <div className="flex items-center gap-2">
    {/* Theme Selector */}
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg
        transition-colors duration-200">
        {settings.enableDarkMode ? (
          <MoonIcon className="w-5 h-5" />
        ) : (
          <SunIcon className="w-5 h-5" />
        )}
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg
        shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        {THEMES.map((themeOption) => (
          <Menu.Item key={themeOption.name}>
            {({ active }) => (
              <button
                onClick={() => onThemeChange(themeOption)}
                className={clsx(
                  'flex items-center gap-2 w-full px-4 py-2 text-sm',
                  'transition-colors duration-200',
                  active && 'bg-gray-100 dark:bg-gray-700',
                  theme.name === themeOption.name && 'text-blue-500'
                )}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: themeOption.accentColor }}
                />
                {themeOption.name}
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>

    {/* Import/Export */}
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg
        transition-colors duration-200">
        <DocumentDuplicateIcon className="w-5 h-5" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg
        shadow-lg focus:outline-none z-50">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={onExport}
              className={clsx(
                'flex items-center w-full px-4 py-2 text-sm',
                'transition-colors duration-200',
                active && 'bg-gray-100 dark:bg-gray-700'
              )}
            >
              Export Settings
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <label
              className={clsx(
                'flex items-center w-full px-4 py-2 text-sm cursor-pointer',
                'transition-colors duration-200',
                active && 'bg-gray-100 dark:bg-gray-700'
              )}
            >
              Import Settings
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={onImport}
                data-import-input
              />
            </label>
          )}
        </Menu.Item>
      </Menu.Items>
    </Menu>

    {/* Keyboard Shortcuts */}
    <button
      onClick={onToggleKeyboardShortcuts}
      className="p-2 text-gray-500 hover:text-gray-700 rounded-lg
        transition-colors duration-200"
    >
      <KeyIcon className="w-5 h-5" />
    </button>
  </div>
);

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className }) => (
  <div className={clsx(
    'flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg',
    'dark:text-red-400 dark:bg-red-900/30',
    className
  )}>
    <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
    <p>{message}</p>
  </div>
);

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Keyboard Shortcuts
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400
            dark:hover:text-gray-300 transition-colors duration-200"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-3">
        {KEYBOARD_SHORTCUTS.map(({ key, description }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </span>
            <kbd className={clsx(
              'px-2 py-1 text-xs font-semibold rounded-md',
              'bg-gray-100 dark:bg-gray-700',
              'border border-gray-200 dark:border-gray-600',
              'text-gray-800 dark:text-gray-200'
            )}>
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  </div>
);