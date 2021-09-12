import {ChangeEvent, useCallback, useEffect, useState} from "react";

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
import BaseModal from "../../../shared/ui/BaseModal";

// Types
interface Props {
    isShown: boolean
    onHide(): void
    note: Note | null
    shouldOpenInEditMode: boolean
    onSaveNote(newNote: Note): void
    onDeleteNote(targetNote: Note): void
}

// Main
function NoteModal({isShown, onHide, note, shouldOpenInEditMode, onSaveNote, onDeleteNote}: Props) {

    const [isInEditMode, setIsInEditMode] = useState(shouldOpenInEditMode)
    const [localContent, setLocalContent] = useState('')

    useEffect(() => {
        setLocalContent(note?.content || '')
        setIsInEditMode(shouldOpenInEditMode)
    }, [note, shouldOpenInEditMode])

    const saveNote = useCallback(() => {
        setIsInEditMode(false)
        if (!note) {
            throw new Error('Tried saving a note that is not defined.')
        }

        onSaveNote({...note, content: localContent})
    }, [note, localContent, onSaveNote])

    const setContent = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setLocalContent(event.currentTarget.value)
    }

    return (
        <BaseModal
            isShown={isShown}
            onHide={() => onHide()}
            renderHeader={() => (
                <div className={'notes-modal-header'}>
                    <ArrowBack onClick={onHide}/>
                    <div className={'spacer'}/>
                    {/* TODO: hide instead of conditional rendering */}
                    {isInEditMode || <Edit onClick={() => setIsInEditMode(true)}/>}
                    {isInEditMode && <Save onClick={() => saveNote()}/>}
                    <Delete onClick={() => onDeleteNote(note!)}/>
                </div>
            )}
        >
            <div className="notes-modal-content">
                {isInEditMode ? (
                    <textarea
                        className={'notes-modal-editor'}
                        value={localContent}
                        onChange={setContent}
                    />
                ) : <ReactMarkdown className={'markdown'} children={localContent}/>}
            </div>
        </BaseModal>
    )
}

export default NoteModal
