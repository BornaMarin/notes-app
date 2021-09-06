import {useCallback, useState, MouseEvent, useRef} from "react";

// Types
import {Note} from "../types/Note";

// Style
import './NotesView.css'

// Components
import ReactMarkdown from 'react-markdown'
import NoteModal from "../components/NoteModal";
import VirtualScroll from "../../../shared/ui/VirtualScroll";

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
        <>
            <VirtualScroll
                tolerance={1}
                items={['add', ...notes.notes]}
                renderItem={(note) =>
                    typeof note === 'string'
                        ? (<div key={'add'} className={'notes-add-button'} onClick={() => createNewNote()}>+</div>)
                        : (
                            <div
                                key={note.id}
                                ref={noteRef /* TODO: use callback to map refs to an array */}
                                className={'notes-item'}
                                onClick={e => openNote(note, e)}
                            >
                                <ReactMarkdown
                                    children={note.content}
                                    className={'notes-item-content'}
                                />
                            </div>
                        )}
                className={'notes-container'}
            />
            <NoteModal
                isShown={openedNote !== null}
                onHide={() => setOpenedNote(null)}
                note={openedNote}
                shouldOpenInEditMode={shouldOpenInEditMode}
                onSaveNote={updateNote}
                onDeleteNote={deleteNote}
                openerElement={openerElement}
            />
        </>
    )
}

export default NotesView
