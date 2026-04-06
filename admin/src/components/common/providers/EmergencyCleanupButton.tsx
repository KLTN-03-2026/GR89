'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'
import { forceCleanupAllDialogs } from './DialogCleanupProvider'

export function EmergencyCleanupButton() {
  const [showButton, setShowButton] = useState(false)

  // Show button if there are stuck overlays
  useEffect(() => {
    const checkForStuckOverlays = () => {
      const overlays = document.querySelectorAll('[data-radix-dialog-overlay]')
      const hasStuckOverlay = overlays.length > 0
      const bodyHasPointerEventsNone = document.body.style.pointerEvents === 'none'

      if (hasStuckOverlay || bodyHasPointerEventsNone) {
        setShowButton(true)
      }
    }

    // Check immediately
    checkForStuckOverlays()

    // Check every 2 seconds
    const interval = setInterval(checkForStuckOverlays, 2000)

    return () => clearInterval(interval)
  }, [])

  const handleCleanup = () => {
    forceCleanupAllDialogs()
    setShowButton(false)
  }

  if (!showButton) return null

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <div className="bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">UI bị đóng băng?</span>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleCleanup}
          className="ml-2"
        >
          Sửa ngay
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowButton(false)}
          className="text-white hover:bg-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
