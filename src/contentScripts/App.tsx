import React from 'react'
import { useSettings } from '@/hooks/useSettings'

export const App: React.FC = () => {
  const { settings } = useSettings() // Destructure to make it clear we'll use it later

  return (
    <div className="github-customizer">
      {/* Use settings to conditionally render UI elements */}
      {settings.hideActivity && (
        <div className="hidden-notice">Activity section is hidden</div>
      )}
      {/* Add more conditional rendering based on settings */}
    </div>
  )
}