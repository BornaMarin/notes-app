import {useContext} from "react";
import {NotesContext} from "../components/NotesProvider";

function useNotes() {

    const notesContext = useContext(NotesContext)
    if (!notesContext) throw new Error('NotesView should be nested inside NotesProvider!')

    return notesContext
}

export {useNotes}
