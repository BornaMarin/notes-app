import {useCallback, useEffect, useRef, useState} from "react";

// Types
import {Note} from "../types/Note";

// Styles
import './NoteModal.css'

// Components
import ArrowBack from "../../../shared/icons/ArrowBack";
import Edit from "../../../shared/icons/Edit";
import Save from "../../../shared/icons/Save";
import Delete from "../../../shared/icons/Delete";
import ReactMarkdown from "react-markdown";

// Types
interface Props {
    isShown: boolean
    note: Note | null
    shouldOpenInEditMode: boolean
    openerElement: HTMLElement | null
    onHide(): void
    onSaveNote(newNote: Note): void
    onDeleteNote(targetNote: Note): void
}

// Main
function NoteModal({isShown, onHide, note, shouldOpenInEditMode, onSaveNote, onDeleteNote, openerElement}: Props) {

    const [isInEditMode, setIsInEditMode] = useState(shouldOpenInEditMode)
    const [localContent, setLocalContent] = useState('')
    const [isContentShown, setIsContentShown] = useState(false)
    const container = useRef<HTMLDivElement>(null)
    const overlay = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLocalContent(note?.content || '')
        setIsInEditMode(shouldOpenInEditMode)

        const CLASS_NAME = 'overflow-hidden'
        const action: keyof DOMTokenList = isShown ? 'add' : 'remove'
        document.body.classList[action](CLASS_NAME)

        // https://www.youtube.com/watch?v=3-Wn6iYIeG8
        animateModal()

        function animateModal() {
            if (!container.current) return
            isShown && setIsContentShown(false)
            const {top, bottom, left, right} = getStartingPosition()
            container.current.style.inset = [top, window.innerWidth - right, window.innerHeight - bottom, left].map(p => p + 'px').join(' ')

            const DURATION = 300
            requestAnimationFrame(() => {
                if (!container.current || !overlay.current) throw new Error('Overlay not mounted!')
                const CLASS_TO_REMOVE = isShown ? 'invisible' : 'visible'
                const CLASS_TO_ADD = isShown ? 'visible' : 'invisible'
                overlay.current?.classList.remove(CLASS_TO_REMOVE)
                overlay.current?.classList.add(CLASS_TO_ADD)
                container.current?.classList.remove(CLASS_TO_REMOVE)
                container.current?.classList.add(CLASS_TO_ADD)

                overlay.current.style.transition = `opacity ${DURATION}ms`
                container.current.style.transition = `inset ${DURATION}ms, opacity ${DURATION}ms`
                isShown && (container.current.style.inset = '')
                setTimeout(() => {
                    setIsContentShown(isShown)
                }, DURATION)
            })
        }

        function getStartingPosition() {
            if (openerElement) {
                return openerElement.getBoundingClientRect()
            } else {
                const top = window.innerHeight
                const left = window.innerWidth / 2
                return {top, bottom: top, left, right: left}
            }
        }
    }, [isShown, note, shouldOpenInEditMode, openerElement])

    const saveNote = useCallback(() => {
        setIsInEditMode(false)
        if (!note) {
            throw new Error('Tried saving a note that is not defined.')
        }

        onSaveNote({...note, content: localContent})
    }, [note, localContent, onSaveNote])

    const setContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalContent(event.currentTarget.value)
    }

    return (isShown || isContentShown) ? (
        <>
            <div className={'notes-modal-overlay invisible'} ref={overlay}/>
            <div className={'notes-modal-container invisible'} ref={container}>
                <div className={'notes-modal-header'}>
                    <ArrowBack onClick={onHide}/>
                    <div className={'spacer'}/>
                    {/* TODO: hide instead of conditional rendering */}
                    {isInEditMode || <Edit onClick={() => setIsInEditMode(true)}/>}
                    {isInEditMode && <Save onClick={() => saveNote()}/>}
                    <Delete onClick={() => onDeleteNote(note!)}/>
                </div>
                <div className={'notes-modal-content ' + (isContentShown ? 'visible' : 'invisible')}>
                    {isInEditMode ? (
                        <textarea
                            className={'notes-modal-editor'}
                            value={localContent}
                            onChange={setContent}
                        />
                    ) : <ReactMarkdown className={'markdown'} children={localContent}/>}
                </div>
            </div>
        </>
    ) : null
}

export default NoteModal
