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
    onHide(): void
    note: Note | null
    shouldOpenInEditMode: boolean
    openerElement: HTMLElement | null
    onSaveNote(newNote: Note): void
    onDeleteNote(targetNote: Note): void
}

// Main
function NoteModal({isShown, onHide, note, shouldOpenInEditMode, onSaveNote, onDeleteNote, openerElement}: Props) {

    const [isInEditMode, setIsInEditMode] = useState(shouldOpenInEditMode)
    const [localContent, setLocalContent] = useState('')
    const [isLocalShown, setIsLocalShown] = useState(false)
    const container = useRef<HTMLDivElement>(null)
    const overlay = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setLocalContent(note?.content || '')
        setIsInEditMode(shouldOpenInEditMode)
        isShown && setIsLocalShown(false)

        const CLASS_NAME = 'overflow-hidden'
        const action: keyof DOMTokenList = isShown ? 'add' : 'remove'
        document.body.classList[action](CLASS_NAME)

        // https://www.youtube.com/watch?v=3-Wn6iYIeG8
        if (!container.current || !openerElement) return
        const {top, bottom, left, right} = openerElement.getBoundingClientRect();
        container.current.style.inset = [top, window.innerWidth - right, window.innerHeight - bottom, left].map(p => p + 'px').join(' ')
        requestAnimationFrame(() => {
            if (!container.current || !overlay.current) return
            overlay.current?.classList.remove(isShown ? 'invisible' : 'visible')
            overlay.current?.classList.add(isShown ? 'visible' : 'invisible')
            container.current?.classList.remove(isShown ? 'invisible' : 'visible')
            container.current?.classList.add(isShown ? 'visible' : 'invisible')

            container.current.style.transition = 'inset 0.3s, opacity 0.3s'
            isShown && (container.current.style.inset = '')
            setTimeout(() => {
                setIsLocalShown(isShown)
            }, 300)
        })
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

    return (isShown || isLocalShown) ? (
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
                <div className={'notes-modal-content ' + (isLocalShown ? 'visible' : 'invisible')}>
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
