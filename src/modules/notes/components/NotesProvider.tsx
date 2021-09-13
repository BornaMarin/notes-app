import { createContext, FC, useCallback, useEffect, useState } from 'react'

// Hooks
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage'

// Types
import { Note } from '../types/Note'

interface Context {
    notes: Note[]
    getAllIds(): number[]
    get(id: number): Note
    add(content: string): Note
    save(id: number, content: string): void
    remove(id: number): void
}

// Utils
function findNoteIndex(id: number, sourceNotes: Note[]) {
    const NOTE_INDEX = sourceNotes.findIndex(note => note.id === id)
    if (NOTE_INDEX === -1) throw new Error(`Note with ID ${id} not found!`)
    return NOTE_INDEX
}

// Context
export const NotesContext = createContext<Context | null>(null)

// Main
const NotesProvider: FC = ({ children }) => {

    const [notes, setNotes] = useState<Note[]>([])
    const lStorage = useLocalStorage({ notes: [] as Note[] })

    useEffect(() => {
        setNotes(lStorage.notes)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        lStorage.notes = notes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notes])

    const getAllIds = useCallback(() => notes.map(note => note.id), [notes])

    const get = useCallback((id: number) => {
        const NOTE_INDEX = findNoteIndex(id, notes)
        return notes[NOTE_INDEX]
    }, [notes])

    const add = useCallback((content = '') => {
        const noteIds = getAllIds()
        const LAST_ID = Math.max(...noteIds, 1)
        const newNote = {
            id: LAST_ID + 1,
            content,
        }
        setNotes(oldNotes => [...oldNotes, newNote])
        return newNote
    }, [getAllIds])

    const save = useCallback((id: number, content = '') => {
        setNotes((oldNotes) => {
            const NOTE_INDEX = findNoteIndex(id, oldNotes)
            const notesCopy = [...oldNotes]
            notesCopy[NOTE_INDEX] = { id, content }
            return notesCopy
        })
    }, [])

    const remove = useCallback((id: number) => {
        setNotes((oldNotes) => {
            const NOTE_INDEX = findNoteIndex(id, oldNotes)
            const notesCopy = [...oldNotes]
            notesCopy.splice(NOTE_INDEX, 1)
            return notesCopy
        })
    }, [])

    const value = {
        notes,
        getAllIds,
        get,
        add,
        save,
        remove,
    }

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    )
}

export default NotesProvider
