import {Fragment, ReactElement, ReactNode, useEffect, useRef} from "react";
import {createPortal} from "react-dom";

// Styles
import './BaseModal.css'

// Hooks
import {useEventListener} from "../hooks/useEventListener";

// Types
interface Props {
    isShown: boolean
    onHide(): void
    children?: ReactNode
    renderHeader?(): ReactElement
}

// Main
function BaseModal({isShown, onHide, children, renderHeader}: Props) {

    const modalRoot = useRef<HTMLElement>(document.getElementById('modal-root'))
    if (!modalRoot.current) throw new Error('#modal-root not found!')

    useEventListener('keydown', (e: KeyboardEvent) => e.key === 'Escape' && onHide())

    useEffect(() => {
        const CLASS_NAME = 'overflow-hidden'
        const action: keyof DOMTokenList = isShown ? 'add' : 'remove'
        document.body.classList[action](CLASS_NAME)
    }, [isShown])

    return createPortal(isShown ? (
        <Fragment>
            <div className={'modal-overlay'} onClick={() => onHide()}/>
            <div className={'modal-container'}>
                <div className={'modal-header'}>
                    {renderHeader?.()}
                </div>
                <div className={'modal-content'}>
                    {children}
                </div>
            </div>
        </Fragment>
    ) : null, modalRoot.current)
}

export default BaseModal
