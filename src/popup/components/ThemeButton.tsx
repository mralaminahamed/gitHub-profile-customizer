import React from 'react';
import clsx from 'clsx';
import type { Theme } from '@/types';
import { CheckIcon } from '@heroicons/react/24/outline';

interface ThemeButtonProps {
  theme: Theme;
  isActive: boolean;
  onClick: () => void;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({ theme, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={clsx(
      'relative w-full aspect-square rounded-lg p-2 transition-all duration-200',
      'border-2 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
      isActive ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-200',
    )}
    style={{ backgroundColor: theme.background }}>
    {/* Theme Preview */}
    <div className="w-full h-full rounded-md overflow-hidden">
      {/* Header */}
      <div
        className="h-1/4 w-full"
        style={{ backgroundColor: theme.accentColor }}
      />
      {/* Content */}
      <div className="p-1 space-y-1">
        <div
          className="w-3/4 h-1 rounded-full"
          style={{ backgroundColor: theme.border }}
        />
        <div
          className="w-1/2 h-1 rounded-full"
          style={{ backgroundColor: theme.border }}
        />
      </div>
    </div>

    {/* Theme Name */}
    <div
      className="absolute bottom-1 left-1 right-1 text-xs font-medium truncate px-1"
      style={{ color: theme.text }}
    >
      {theme.name}
    </div>

    {/* Active Indicator */}
    {isActive && (
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full
  flex items-center justify-center text-white shadow-lg">
        <CheckIcon className="w-4 h-4" />
      </div>
    )}
  </button>
);

// Export a Themed Component HOC
export function withTheme<P extends object>(Component: React.ComponentType<P>, theme: Theme,): React.FC<P> {
  return function ThemedComponent(props: P) {
    return (
      <div style={{
        backgroundColor: theme.background,
        color: theme.text,
        borderColor: theme.border,
      }}>
        <Component {...props} />
      </div>
    );
  };
}