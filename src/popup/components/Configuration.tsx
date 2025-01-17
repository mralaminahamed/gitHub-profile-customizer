import React from 'react'
import { Switch } from '@headlessui/react'
import clsx from 'clsx'
import type { Settings } from '@/types'

interface ConfigSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export const ConfigSection: React.FC<ConfigSectionProps> = ({
                                                              title,
                                                              description,
                                                              children
                                                            }) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
      {children}
    </div>
  </div>
)

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  presetColors: string[]
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
                                                          value,
                                                          onChange,
                                                          presetColors
                                                        }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer"
      />
      <input
        type="text"
        value={value.toUpperCase()}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-700
          border border-gray-200 dark:border-gray-600 rounded-lg
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="#000000"
      />
    </div>
    <div className="flex flex-wrap gap-2">
      {presetColors.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={clsx(
            'w-6 h-6 rounded-full transition-all duration-200',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2',
            value === color && 'ring-2 ring-blue-500 ring-offset-2'
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  </div>
)

interface ShortcutInputProps {
  value: string
  onChange: (shortcut: string) => void
  placeholder?: string
}

export const ShortcutInput: React.FC<ShortcutInputProps> = ({
                                                              value,
                                                              onChange,
                                                              placeholder
                                                            }) => {
  const [isRecording, setIsRecording] = React.useState(false)
  const [keys, setKeys] = React.useState<Set<string>>(new Set())

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return
    e.preventDefault()

    const key = e.key.toLowerCase()
    if (key === 'escape') {
      setIsRecording(false)
      setKeys(new Set())
      return
    }

    if (key === 'backspace') {
      onChange('')
      setKeys(new Set())
      setIsRecording(false)
      return
    }

    const newKeys = new Set(keys)
    if (e.ctrlKey) newKeys.add('ctrl')
    if (e.metaKey) newKeys.add('⌘')
    if (e.altKey) newKeys.add('alt')
    if (e.shiftKey) newKeys.add('shift')
    if (!['control', 'meta', 'alt', 'shift'].includes(key)) {
      newKeys.add(key)
    }

    setKeys(newKeys)
    onChange(Array.from(newKeys).join('+'))
  }

  return (
    <div
      onClick={() => setIsRecording(true)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={clsx(
        'px-3 py-1.5 text-sm rounded-lg border transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        isRecording
          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800'
          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      )}
    >
      {isRecording ? (
        <span className="text-blue-600 dark:text-blue-400">
          Recording... Press Esc to cancel
        </span>
      ) : value ? (
        <span className="text-gray-900 dark:text-gray-100">{value}</span>
      ) : (
        <span className="text-gray-400">{placeholder || 'Click to record shortcut'}</span>
      )}
    </div>
  )
}

interface SwitchItemProps {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const SwitchItem: React.FC<SwitchItemProps> = ({
                                                        title,
                                                        description,
                                                        checked,
                                                        onChange
                                                      }) => (
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

interface ExportImportProps {
  onExport: () => void
  onImport: (settings: Settings) => void
}

export const ExportImport: React.FC<ExportImportProps> = ({ onExport, onImport }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)
        onImport(settings)
      } catch (error) {
        console.error('Failed to parse settings file:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={onExport}
        className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50
          rounded-lg hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30
          dark:hover:bg-blue-900/50 transition-colors duration-200"
      >
        Export Settings
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50
          rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800
          dark:hover:bg-gray-700 transition-colors duration-200"
      >
        Import Settings
      </button>
    </div>
  )
}