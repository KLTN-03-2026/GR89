import { useCallback } from 'react'

export const useModalCleanup = () => {
  const cleanupModal = useCallback(() => {
    // Immediate cleanup first
    const immediateCleanup = () => {
      // Remove any dialog overlays that might be stuck
      const overlays = document.querySelectorAll('[data-radix-dialog-overlay]')
      overlays.forEach(overlay => overlay.remove())

      // Remove any modal backdrops that might be stuck
      const backdrops = document.querySelectorAll('[data-radix-popper-content-wrapper]')
      backdrops.forEach(backdrop => backdrop.remove())

      // Remove any portal containers that are empty
      const portals = document.querySelectorAll('[data-radix-portal]')
      portals.forEach(portal => {
        if (portal.children.length === 0) {
          portal.remove()
        }
      })

      // Force reset body styles immediately
      if (document.body) {
        document.body.style.pointerEvents = 'auto'
        document.body.style.overflow = ''
        document.body.removeAttribute('data-scroll-locked')
      }

      // Reset html overflow
      document.documentElement.style.overflow = ''
      document.documentElement.removeAttribute('data-scroll-locked')

      // Remove any stuck z-index styles
      const elements = document.querySelectorAll('[style*="z-index"]')
      elements.forEach(el => {
        const element = el as HTMLElement
        if (element.style.zIndex && parseInt(element.style.zIndex) > 1000) {
          element.style.zIndex = ''
        }
      })
    }

    // Run immediate cleanup
    immediateCleanup()

    // Run again after a short delay to catch any delayed elements
    setTimeout(immediateCleanup, 50)
    setTimeout(immediateCleanup, 150)
  }, [])

  return { cleanupModal }
}
