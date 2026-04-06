import { useEffect } from 'react'
import { forceCleanupAllDialogs } from '@/components/common/providers/DialogCleanupProvider'

export const useGlobalDialogCleanup = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+C to force cleanup all dialogs
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault()
        forceCleanupAllDialogs()
      }
    }

    // Add event listener
    document.addEventListener('keydown', handleKeyDown)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}
