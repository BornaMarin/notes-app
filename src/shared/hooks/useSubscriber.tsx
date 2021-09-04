import {useCallback, useEffect, useState} from "react";

function useSubscriber<Target>(target: Target) {

    type Callback = (updatedTarget: Target) => unknown
    interface Sub {
        callback: Callback
        unsubscribe(): void
    }

    const [subscriptions, setSubscriptions] = useState<Sub[]>([])

    useEffect(() => {
        subscriptions.forEach(sub => sub.callback(target))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target])

    const unsubscribe = useCallback((callback: Callback) => {
        setSubscriptions((oldSubs) => {
            const SUB_INDEX = oldSubs.findIndex(sub => sub.callback === callback)
            const subsCopy = [...oldSubs]
            subsCopy.splice(SUB_INDEX, 1)
            return subsCopy
        })
    }, [])

    const subscribe = useCallback((callback: Callback) => {
        const newSub = {
            callback,
            unsubscribe() { unsubscribe(callback) }
        }
        setSubscriptions((oldSubs) => {
            return [...oldSubs, newSub]
        })
        return newSub
    }, [unsubscribe])

    return {subscribe, unsubscribe}
}

export {useSubscriber}
