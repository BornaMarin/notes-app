import {Fragment, useEffect} from "react";

// Styles
import './NoteModal.css'

// Components
import ArrowBack from "../../../shared/icons/ArrowBack";
import Edit from "../../../shared/icons/Edit";
import Save from "../../../shared/icons/Save";
import Delete from "../../../shared/icons/Delete";
import ReactMarkdown from "react-markdown";

// Types
interface Props {
    isShown: boolean
    onHide(): void
    note: string
}

// Main
function NoteModal({isShown, onHide, note}: Props) {

    useEffect(() => {
        const CLASS_NAME = 'overflow-hidden'
        const action: keyof DOMTokenList = isShown ? 'add' : 'remove'
        document.body.classList[action](CLASS_NAME)
    }, [isShown])

    return isShown ? (
        <Fragment>
            <div className={'notes-modal-overlay'}/>
            <div className={'notes-modal-container'}>
                <div className={'notes-modal-header'}>
                    <ArrowBack onClick={onHide}/>
                    <div className={'spacer'}/>
                    <Edit/>
                    <Save/>
                    <Delete/>
                </div>
                <div className="notes-modal-content">
                    <ReactMarkdown children={note}/>
                </div>
            </div>
        </Fragment>
    ) : null
}

export default NoteModal
