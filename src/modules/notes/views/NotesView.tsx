import { useCallback, useReducer } from 'react'

// Style
import './NotesView.css'

// Components
import ReactMarkdown from 'react-markdown'
import NoteModal from '../components/NoteModal'

// Hooks
import { useNotes } from '../hooks/useNotes'

// Types
import { Note } from '../types/Note'

interface ModalState {
    openedNote: Note | null
    shouldOpenInEditMode: boolean
}

type ModalAction = { type: 'view' | 'edit', note: Note } | { type: 'delete' | 'close', note?: undefined }

// Reducers
function modalReducer(state: ModalState, { type, note }: ModalAction): ModalState {
    return {
        openedNote: note || null,
        shouldOpenInEditMode: type === 'edit',
    }
}

// Main
function NotesView() {

    const notes = useNotes()
    const { ids, byId } = notes.state
    const [modalState, modalDispatch] = useReducer(modalReducer, { shouldOpenInEditMode: false, openedNote: null })
    const { openedNote, shouldOpenInEditMode } = modalState

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

        const newNote = notes.add(DEFAULT_CONTENT)
        modalDispatch({ type: 'edit', note: newNote })
    }, [notes])

    const openNote = useCallback((note: Note) => {
        modalDispatch({ type: 'view', note })
    }, [])

    const updateNote = useCallback(({ id, content }: Note) => {
        notes.save(id, content)
    }, [notes])

    const deleteNote = useCallback(({ id }: Note) => {
        notes.remove(id)
        modalDispatch({ type: 'delete' })
    }, [notes])

    return (
        <div className={'notes-container'}>
            <div className={'notes-add-button'} onClick={() => createNewNote()}>+</div>
            {ids.map(id => (
                <div key={id} className={'notes-item'} onClick={() => openNote(byId[id])}>
                    <ReactMarkdown
                        children={byId[id].content}
                        className={'notes-item-content'}
                    />
                </div>
            ))}
            <NoteModal
                isShown={openedNote !== null}
                onHide={() => modalDispatch({ type: 'close' })}
                note={openedNote}
                shouldOpenInEditMode={shouldOpenInEditMode}
                onSaveNote={updateNote}
                onDeleteNote={deleteNote}
            />
        </div>
    )
}

export default NotesView
