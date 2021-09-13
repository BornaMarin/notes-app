function useLocalStorage<DefaultValues extends Record<string, unknown>>(defaultValues?: DefaultValues) {
    return new Proxy<DefaultValues>(defaultValues!, {
        get(target, p: string): unknown {
            const storedValue = localStorage.getItem(p)
            if (!storedValue) return defaultValues?.[p] || null
            try {
                return JSON.parse(storedValue)
            } catch (e) {
                return storedValue
            }
        },
        set(target, p: string, value): boolean {
            localStorage.setItem(p, JSON.stringify(value))
            return true
        },
    })
}

export { useLocalStorage }
