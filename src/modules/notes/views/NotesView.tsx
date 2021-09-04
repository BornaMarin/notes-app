import {useCallback, useState, MouseEvent, useRef} from "react";

// Types
import {Note} from "../types/Note";

// Style
import './NotesView.css'

// Components
import ReactMarkdown from 'react-markdown'
import NoteModal from "../components/NoteModal";

// Hooks
import {useNotes} from "../hooks/useNotes";

// Main
function NotesView() {

    const notes = useNotes()
    const [openedNote, setOpenedNote] = useState<Note | null>(null)
    const [shouldOpenInEditMode, setShouldOpenInEditMode] = useState(false)
    const [openerElement, setOpenerElement] = useState<HTMLDivElement | null>(null)
    const noteRef = useRef(null)

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

        // zbog mojeg izmišljanja, svaka od sljedećih linija će izazvati novi render :)
        const newNote = await notes.add(DEFAULT_CONTENT)
        process.nextTick(() => {
            setOpenedNote(newNote)
            setShouldOpenInEditMode(true)
            setOpenerElement(noteRef.current)
        })
    }, [notes])

    const openNote = useCallback((note: Note, e: MouseEvent<HTMLDivElement>) => {
        setOpenedNote(note)
        setShouldOpenInEditMode(false)
        setOpenerElement(e.currentTarget)
    }, [])

    const updateNote = useCallback(({id, content}: Note) => {
        notes.save(id, content)
    }, [notes])

    const deleteNote = useCallback(({id}: Note) => {
        notes.remove(id)
        setOpenedNote(null)
    }, [notes])

    return (
        <div className={'notes-container'}>
            <div className={'notes-add-button'} onClick={() => createNewNote()}>+</div>
            {notes.notes.map(note => (
                <div
                    key={note.id}
                    ref={noteRef}
                    className={'notes-item'}
                    onClick={e => openNote(note, e)}
                >
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
                openerElement={openerElement}
            />
        </div>
    )
}

export default NotesView
