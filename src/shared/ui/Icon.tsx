import './Icon.css'
import {IconPassProps} from "./IconPassProps";

interface Props {
    width?: number;
    height?: number;
    path: string
}

function Icon({width, height, path, onClick}: Props & IconPassProps) {
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg" onClick={onClick}>
            <path d={path} className={'icon'} fillRule="evenodd" clipRule="evenodd"/>
        </svg>
    )
}

export default Icon
