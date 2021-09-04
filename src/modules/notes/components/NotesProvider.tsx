import {createContext, FC, useCallback, useEffect, useState} from "react";

// Hooks
import {useSubscriber} from "../../../shared/hooks/useSubscriber";

// Types
import {Note} from "../types/Note";
interface Context {
    notes: Note[]
    createNote(content: string): Promise<Note>
    updateNote(id: number, content: string): void
    deleteNote(id: number): void
}

// Context
export const NotesContext = createContext<Context | null>(null);

// Main
const NotesProvider: FC = ({children}) => {

    const [notes, setNotes] = useState<Note[]>([])
    const NOTES_STORAGE_KEY = 'notes'

    useEffect(() => {
        const notesStorage = localStorage.getItem(NOTES_STORAGE_KEY)
        notesStorage && setNotes(JSON.parse(notesStorage))
    }, [])

    useEffect(() => {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
    }, [notes])

    const findNoteIndex = useCallback((id: number, sourceNotes: Note[]) => {
        const NOTE_INDEX = sourceNotes.findIndex(note => note.id === id)
        if (NOTE_INDEX === -1) throw new Error(`Note with ID ${id} not found!`)
        return NOTE_INDEX
    }, [])

    const notes$ = useSubscriber(notes)
    const createNote = useCallback((content = '') => {
        return new Promise<Note>((resolve) => {

            // This whole ordeal is just for the fun of it, it's not neat
            const sub = notes$.subscribe((newNotes) => {
                const newestNote = newNotes[newNotes.length - 1]
                resolve(newestNote)
                sub.unsubscribe()
            })

            setNotes((oldNotes) => {
                const noteIds = oldNotes.map(note => note.id)
                const LAST_ID = Math.max(...noteIds, 1)
                const newNote = {
                    id: LAST_ID + 1,
                    content
                }
                return [...oldNotes, newNote]
            })
        })
    }, [notes$])

    const updateNote = useCallback((id: number, content = '') => {
        setNotes((oldNotes) => {
            const NOTE_INDEX = findNoteIndex(id, oldNotes)
            const notesCopy = [...oldNotes]
            notesCopy[NOTE_INDEX] = {id, content}
            return notesCopy
        })
    }, [findNoteIndex])

    const deleteNote = useCallback((id: number) => {
        setNotes((oldNotes) => {
            const NOTE_INDEX = findNoteIndex(id, oldNotes)
            const notesCopy = [...oldNotes]
            notesCopy.splice(NOTE_INDEX, 1)
            return notesCopy
        })
    }, [findNoteIndex])

    const value = {
        notes,
        createNote,
        updateNote,
        deleteNote
    }

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    )
}

export default NotesProvider
