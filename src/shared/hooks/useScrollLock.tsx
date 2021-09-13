import { useLayoutEffect } from 'react'

function useScrollLock(deps: unknown[] = []) {
    useLayoutEffect(() => {
        const CLASS_NAME = 'overflow-hidden'
        const action: keyof DOMTokenList = !deps.length || deps.some(Boolean) ? 'add' : 'remove'
        document.body.classList[action](CLASS_NAME)
        if (!deps.length) return () => document.body.classList.remove(CLASS_NAME)
    }, deps)
}

export { useScrollLock }
