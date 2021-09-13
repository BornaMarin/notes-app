import { Fragment, ReactElement, ReactNode, useRef } from 'react'
import { createPortal } from 'react-dom'

// Styles
import './BaseModal.css'

// Hooks
import { useEventListener } from '../hooks/useEventListener'
import { useScrollLock } from '../hooks/useScrollLock'

// Types
interface Props {
    isShown: boolean
    children?: ReactNode
    onHide(): void
    renderHeader?(): ReactElement
}

// Main
function BaseModal({ isShown, onHide, children, renderHeader }: Props) {

    const modalRoot = useRef<HTMLElement>(document.getElementById('modal-root'))
    if (!modalRoot.current) throw new Error('#modal-root not found!')

    useEventListener('keydown', (e) => e.key === 'Escape' && onHide())
    useScrollLock([isShown])

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
