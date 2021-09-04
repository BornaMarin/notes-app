import {useCallback, useContext, useState} from "react";

// Types
import {Note} from "../types/Note";

// Style
import './NotesView.css'

// Components
import ReactMarkdown from 'react-markdown'
import NoteModal from "../components/NoteModal";

// Context
import {NotesContext} from "../components/NotesProvider";

// Main
function NotesView() {

    const notesContext = useContext(NotesContext)
    if (!notesContext) throw new Error('NotesView should be nested inside NotesProvider!')

    const [openedNote, setOpenedNote] = useState<Note | null>(null)
    const [shouldOpenInEditMode, setShouldOpenInEditMode] = useState(false)

    const createNewNote = useCallback(async () => {
        const DEFAULT_CONTENT = 'This is a note\n' +
            '==============\n' +
            '\n' +
            'Subtitle\n' +
            '--------\n' +
            '\n' +
            '\n' +
            'Shopping list:\n' +
            '* apples\n' +
            '* oranges\n' +
            '* toilet paper\n'
        const newNote = await notesContext.createNote(DEFAULT_CONTENT)
        setOpenedNote(newNote)
        setShouldOpenInEditMode(true)
    }, [notesContext])

    const openNote = useCallback((note: Note) => {
        setOpenedNote(note)
        setShouldOpenInEditMode(false)
    }, [])

    const updateNote = useCallback(({id, content}: Note) => {
        notesContext.updateNote(id, content)
    }, [notesContext])

    const deleteNote = useCallback(({id}: Note) => {
        notesContext.deleteNote(id)
        setOpenedNote(null)
    }, [notesContext])

    return (
        <div className={'notes-container'}>
            <div className={'notes-add-button'} onClick={() => createNewNote()}>+</div>
            {notesContext.notes.map(note => (
                <div key={note.id} className={'notes-item'} onClick={() => openNote(note)}>
                    <ReactMarkdown
                        children={note.content}
                        className={'notes-item-content'}
                    />
                </div>
            ))}
            <NoteModal
                isShown={openedNote !== null}
                onHide={() => setOpenedNote(null)}
                note={openedNote}
                shouldOpenInEditMode={shouldOpenInEditMode}
                onSaveNote={updateNote}
                onDeleteNote={deleteNote}
            />
        </div>
    )
}

export default NotesView
