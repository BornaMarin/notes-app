import {ReactElement, useCallback, useEffect, useMemo, useRef, useState} from "react";

interface Props<Item> {
    items: Item[]
    renderItem(item: Item, index: number): ReactElement
    className: string
    tolerance?: number
}

function isElementNode(child: ChildNode): child is Element {
    return child.nodeType === Node.ELEMENT_NODE
}

let timer: NodeJS.Timeout | null = null

function VirtualScroll<Item>(props: Props<Item>) {

    const renderedItemsContainer = useRef<HTMLDivElement>(null)
    const virtualSpacerTop = useRef<HTMLDivElement>(null)
    const virtualSpacerBottom = useRef<HTMLDivElement>(null)
    const [columnCount, setColumnCount] = useState(0)
    const [rowHeight, setRowHeight] = useState(0)
    const [marginTop, setMarginTop] = useState(NaN)
    const [virtualRowCount, setVirtualRowCount] = useState({top: 0, bottom: 0})

    useEffect(() => {
        if (columnCount && rowHeight) return
        if (!renderedItemsContainer.current) return

        let firstItemTop = NaN
        let columnCounter = 0
        for (let child = renderedItemsContainer.current.firstChild; child !== null; child = child.nextSibling) {

            if (!isElementNode(child)) {
                throw new Error('Nodes must be of type Element!')
            }

            const {top} = child.getBoundingClientRect()
            isNaN(marginTop) && setMarginTop(top)
            isNaN(firstItemTop) && (firstItemTop = top)

            if (top === firstItemTop) {
                columnCounter++
            } else {
                setRowHeight(top - firstItemTop)
                setColumnCount(columnCounter)
                break;
            }

        }
    }, [props.items])

    const scrollCallback = useCallback(() => {
        if (timer) return

        // TODO: lodash it up
        timer = setTimeout(() => {
            const SCROLL_POSITION = document.documentElement.scrollTop
            const SCROLL_POSITION_INSIDE_CONTAINER = Math.max((SCROLL_POSITION - marginTop), 0)
            const ROWS_ABOVE_VIEWPORT_COUNT = Math.floor(SCROLL_POSITION_INSIDE_CONTAINER / rowHeight)
            const ROWS_ALLOWED_OUTSIDE_COUNT = props.tolerance || 0
            const VIRTUAL_ROWS_TOP_COUNT = Math.max(ROWS_ABOVE_VIEWPORT_COUNT - ROWS_ALLOWED_OUTSIDE_COUNT, 0)
            const MAX_VISIBLE_ROWS_COUNT = Math.ceil(window.innerHeight / rowHeight)
            const RENDERED_ROWS_COUNT = MAX_VISIBLE_ROWS_COUNT + ROWS_ALLOWED_OUTSIDE_COUNT * 2
            const TOTAL_ROW_COUNT = Math.ceil(props.items.length / columnCount)
            const VIRTUAL_ROWS_BOTTOM_COUNT = Math.max(TOTAL_ROW_COUNT - RENDERED_ROWS_COUNT - VIRTUAL_ROWS_TOP_COUNT, 0)
            virtualSpacerTop.current!.style.height = VIRTUAL_ROWS_TOP_COUNT * rowHeight + 'px'
            virtualSpacerBottom.current!.style.height = VIRTUAL_ROWS_BOTTOM_COUNT * rowHeight + 'px'
            setVirtualRowCount({
                top: VIRTUAL_ROWS_TOP_COUNT,
                bottom: VIRTUAL_ROWS_BOTTOM_COUNT
            })
            timer && clearTimeout(timer)
            timer = null
            document.documentElement.scrollTop = SCROLL_POSITION
        }, 200)
    }, [columnCount, marginTop, props.items.length, props.tolerance, rowHeight])

    useEffect(() => {
        document.addEventListener('scroll', scrollCallback)
        return () => document.removeEventListener('scroll', scrollCallback)
    },[rowHeight])

    const itemsToRender = useMemo(() => {
        const TOTAL_ROW_COUNT = Math.ceil(props.items.length / columnCount)
        const LAST_RENDERED_ROW_NUMBER = TOTAL_ROW_COUNT - virtualRowCount.bottom
        const START_INDEX = virtualRowCount.top * columnCount
        const END_INDEX = Math.min(props.items.length, LAST_RENDERED_ROW_NUMBER * columnCount)
        return props.items.slice(START_INDEX, END_INDEX)
    }, [virtualRowCount, columnCount, props.items])

    return (
        <div>
            <div ref={virtualSpacerTop}/>
            <div ref={renderedItemsContainer} className={props.className}>
                {/* TODO: render items one by one while doing calculations instead of rendering them all */}
                {((rowHeight && columnCount) ? itemsToRender : props.items).map((item, index) => props.renderItem(item, index))}
            </div>
            <div ref={virtualSpacerBottom}/>
        </div>
    )
}

export default VirtualScroll
