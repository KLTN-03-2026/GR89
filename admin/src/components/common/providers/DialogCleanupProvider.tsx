'use client'
import { useEffect } from 'react'

// Simple dialog cleanup function
export const forceCleanupAllDialogs = () => {
  // Remove any modal overlays
  const modals = document.querySelectorAll('[role="dialog"], .modal, .dialog')
  modals.forEach(modal => modal.remove())

  // Reset body styles
  document.body.style.overflow = ''
  document.body.style.pointerEvents = 'auto'
}

export function DialogCleanupProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Cleanup on mount to remove any stuck dialogs
    forceCleanupAllDialogs()

    // Cleanup on unmount
    return () => {
      forceCleanupAllDialogs()
    }
  }, [])

  useEffect(() => {
    // Guard against any library that sets body pointer-events: none
    const body = document.body
    if (!body) return

    const ensurePointerEvents = () => {
      if (body.style.pointerEvents === 'none') {
        body.style.pointerEvents = 'auto'
      }
    }

    // Run immediately
    ensurePointerEvents()

    // Observe style attribute changes on body and html
    const observer = new MutationObserver(() => ensurePointerEvents())
    observer.observe(body, { attributes: true, attributeFilter: ['style'] })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })

    // Periodic safety check
    const interval = setInterval(ensurePointerEvents, 500)

    return () => {
      observer.disconnect()
      clearInterval(interval)
    }
  }, [])

  return <>{children}</>
}
