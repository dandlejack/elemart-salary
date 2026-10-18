import { useCallback, useEffect, useState } from 'react'

interface RequestState<T> {
    data: T | undefined
    loading: boolean
    error: any
}

// Loads data on mount (and when deps change) and exposes loading/error so pages never show
// an empty table when the backend cannot be reached.
export function useRequest<T>(load: () => Promise<T>, deps: any[] = []) {
    const [state, setState] = useState<RequestState<T>>({ data: undefined, loading: true, error: null })
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        let cancelled = false
        setState(s => ({ ...s, loading: true, error: null }))
        load()
            .then(data => { if (!cancelled) setState({ data, loading: false, error: null }) })
            .catch(error => { if (!cancelled) setState(s => ({ ...s, loading: false, error })) })
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, attempt])

    const reload = useCallback(() => setAttempt(a => a + 1), [])
    const setData = useCallback((data: T) => setState(s => ({ ...s, data })), [])
    return { ...state, reload, setData }
}
