import {useState} from "react";

// Style
import './NotesView.css'

// Components
import ReactMarkdown from 'react-markdown'
import NoteModal from "../components/NoteModal";

// Main
function NotesView() {

    const defaultNotes = Array.from(Array(100))
    const [notes, setNotes] = useState(defaultNotes)
    const [isModalShown, setIsModalShown] = useState(false)
    const markdown = 'This is a note\n' +
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

    return (<div className={'notes-container'}>
        <div className={'notes-add-button'} onClick={() => setIsModalShown(true)}>+</div>
        {notes.map(note => (
            <div key={note} className={'notes-item'}>
                <ReactMarkdown
                    children={markdown}
                    className={'notes-item-content'}
                />
            </div>
        ))}
        <NoteModal isShown={isModalShown} onHide={() => setIsModalShown(false)} note={markdown}/>
    </div>)
}

export default NotesView
