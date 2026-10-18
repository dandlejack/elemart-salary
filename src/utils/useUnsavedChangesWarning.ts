import { useEffect } from 'react'

// Warns before closing or reloading the browser tab while there are unsaved changes.
// In-app navigation is guarded separately with react-router's <Prompt>.
export const useUnsavedChangesWarning = (dirty: boolean) => {
    useEffect(() => {
        if (!dirty) return
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [dirty])
}
