import { createContext, Dispatch, FC, SetStateAction, useCallback, useEffect, useState } from 'react'

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

function useLocalStorageSync<Type>(key: string, initialState: Type): [Type, Dispatch<SetStateAction<Type>>] {

    const [state, setState] = useState(initialState)
    const lStorage = useLocalStorage({ [key]: initialState })

    useEffect(() => {
        setState(lStorage[key])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        lStorage[key] = state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state])

    return [state, setState]
}

// Main
const NotesProvider: FC = ({ children }) => {

    const [notes, setNotes] = useLocalStorageSync('notes', [] as Note[])

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
    }, [getAllIds, setNotes])

    const save = useCallback((id: number, content = '') => {
        setNotes((oldNotes) => {
            const NOTE_INDEX = findNoteIndex(id, oldNotes)
            const notesCopy = [...oldNotes]
            notesCopy[NOTE_INDEX] = { id, content }
            return notesCopy
        })
    }, [setNotes])

    const remove = useCallback((id: number) => {
        setNotes((oldNotes) => {
            const NOTE_INDEX = findNoteIndex(id, oldNotes)
            const notesCopy = [...oldNotes]
            notesCopy.splice(NOTE_INDEX, 1)
            return notesCopy
        })
    }, [setNotes])

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
