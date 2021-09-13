import { IconPassProps } from './IconPassProps'
import Icon from './Icon'

interface IconOptions {
    path: string;
    width: number;
    height: number
}

function createIcon({ path, width, height }: IconOptions) {
    return function ({ onClick }: IconPassProps) {
        return (
            <Icon path={path} width={width} height={height} onClick={onClick}/>
        )
    }
}

export { createIcon }
