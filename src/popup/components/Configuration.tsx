import React from 'react'
import clsx from 'clsx'
import type { Settings } from '@/types'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  presetColors: string[]
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, presetColors }) => (
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