import {useCallback, useState} from "react";

// Types
import {Note} from "../types/Note";

// Style
import './NotesView.css'

// Components
import ReactMarkdown from 'react-markdown'
import NoteModal from "../components/NoteModal";

// Main
function NotesView() {

    const [notes, setNotes] = useState<Note[]>([])
    const [openedNote, setOpenedNote] = useState<Note | null>(null)
    const [shouldOpenInEditMode, setShouldOpenInEditMode] = useState(false)

    const createNewNote = useCallback(() => {
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

        const LAST_ID = Math.max(...notes.map(note => note.id), 1)
        const newNote = {
            id: LAST_ID + 1,
            content: DEFAULT_CONTENT
        }
        setNotes([...notes, newNote])
        setOpenedNote(newNote)
        setShouldOpenInEditMode(true)
    }, [notes])

    const openNote = useCallback((note: Note) => {
        setOpenedNote(note)
        setShouldOpenInEditMode(false)
    }, [])

    const updateNote = useCallback((updatedNote: Note) => {
        const NOTE_INDEX = notes.findIndex(note => note.id === updatedNote.id)
        const newNotes = [...notes]
        newNotes[NOTE_INDEX] = updatedNote
        setNotes(newNotes)
    }, [notes])

    const deleteNote = useCallback((targetNote: Note) => {
        const NOTE_INDEX = notes.findIndex(note => note.id === targetNote.id)
        const newNotes = [...notes]
        newNotes.splice(NOTE_INDEX, 1)
        setNotes(newNotes)
        setOpenedNote(null)
    }, [notes])

    return (<div className={'notes-container'}>
        <div className={'notes-add-button'} onClick={() => createNewNote()}>+</div>
        {notes.map(note => (
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
    </div>)
}

export default NotesView
