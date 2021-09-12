import {useEffect, useRef} from "react";

type EventHandler<K extends keyof WindowEventMap> = (this: Window, ev: WindowEventMap[K]) => unknown

/**
 * @copyright https://usehooks.com/useEventListener/
 */
function useEventListener<K extends keyof WindowEventMap>(eventName: K, handler: EventHandler<K>, element = window) {

    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(
        () => {
            const isSupported = element && element.addEventListener;
            if (!isSupported) return;

            // @ts-ignore
            const eventListener: EventHandler<K> = (event) => savedHandler.current(event);
            element.addEventListener(eventName, eventListener);
            return () => element.removeEventListener(eventName, eventListener)
        },
        [eventName, element]
    );
}

export {useEventListener}
