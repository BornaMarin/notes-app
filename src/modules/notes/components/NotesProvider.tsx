import { createContext, FC, useCallback, useEffect, useReducer } from 'react'

// Types
import { Note } from '../types/Note'

interface Context {
    state: NotesState
    getAllIds(): number[]
    get(id: number): Note
    add(content: string): Note
    save(id: number, content: string): void
    remove(id: number): void
}

interface NotesState {
    ids: number[]
    byId: Record<number, Note>
}

type NotesActions =
    | { type: NotesAction.Set, notes: Note[] }
    | { type: NotesAction.Add, content: string }
    | { type: NotesAction.Update, content: string, id: number }
    | { type: NotesAction.Delete, id: number }

// Enums
enum NotesAction {
    Set,
    Add,
    Update,
    Delete
}

// Utils
function genNewId(existingIds: number[]): number {
    const LAST_ID = Math.max(...existingIds, 1)
    return LAST_ID + 1
}

// Context
export const NotesContext = createContext<Context | null>(null)

// Reducers
function notesReducer(state: NotesState, action: NotesActions): NotesState {
    const stateCopy: NotesState = { ids: [...state.ids], byId: { ...state.byId } }

    switch (action.type) {
        case NotesAction.Update:
            stateCopy.byId[action.id].content = action.content
            break
        case NotesAction.Delete:
            delete stateCopy.byId[action.id]
            const index = stateCopy.ids.indexOf(action.id)
            stateCopy.ids.splice(index, 1)
            break
        case NotesAction.Add:
            const NEW_ID = genNewId(stateCopy.ids)
            const newNote = {
                id: NEW_ID,
                content: action.content,
            }
            stateCopy.ids.push(NEW_ID)
            stateCopy.byId[NEW_ID] = newNote
            break
        case NotesAction.Set:
            stateCopy.ids = action.notes.map(note => note.id)
            stateCopy.byId = {}
            action.notes.forEach(note => stateCopy.byId[note.id] = note)
            break
        default:
            throw new Error(`Action type ${action['type']} is not supported!`)
    }

    return stateCopy
}

// Main
const NotesProvider: FC = ({ children }) => {

    const [state, dispatch] = useReducer(notesReducer, { ids: [], byId: {} })

    const NOTES_STORAGE_KEY = 'notes'

    useEffect(() => {
        const notesStorage = localStorage.getItem(NOTES_STORAGE_KEY)
        notesStorage && dispatch({ type: NotesAction.Set, notes: JSON.parse(notesStorage) })
    }, [])

    useEffect(() => {
        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(state.ids.map(id => state.byId[id])))
    }, [state])

    const getAllIds = useCallback((): number[] => state.ids, [state])

    const get = useCallback((id: number): Note => state.byId[id], [state])

    const add = useCallback((content = ''): Note => {
        dispatch({ type: NotesAction.Add, content })
        return {
            id: genNewId(state.ids),
            content,
        }
    }, [state])

    const save = useCallback((id: number, content = '') => dispatch({ type: NotesAction.Update, id, content }), [])

    const remove = useCallback((id: number) => dispatch({ type: NotesAction.Delete, id }), [])

    const value = {
        state,
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
