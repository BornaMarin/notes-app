import {useCallback, useEffect, useRef} from "react";

function useThrottle(handler: Function, delay = 0) {

    const savedHandler = useRef(handler);
    const timer = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    return useCallback(() => {
        if (timer.current) return

        timer.current = setTimeout(() => {
            savedHandler.current()
            timer.current && clearTimeout(timer.current)
            timer.current = null
        }, delay)
    }, [delay])
}

export {useThrottle}
