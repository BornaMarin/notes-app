import {ReactElement, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useEventListener} from "../hooks/useEventListener";

interface Props<Item> {
    items: Item[]
    renderItem(item: Item, index: number): ReactElement
    className: string
    tolerance?: number
}

enum MeasureStatus {
    ColumnCount,
    RowHeight,
    Done
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
    const [measureStatus, setMeasureStatus] = useState(MeasureStatus.ColumnCount)

    useEventListener('resize', resetMeasureStatus)
    function resetMeasureStatus() {
        setMeasureStatus(MeasureStatus.ColumnCount)
    }


    const measureColumnCount = useCallback(() => {
        const firstItem = renderedItemsContainer.current!.firstChild
        if (!firstItem) return

        const secondItem = firstItem.nextSibling
        if (!secondItem) return

        if (!isElementNode(firstItem) || !isElementNode(secondItem)) {
            throw new Error('Nodes must be of type Element!')
        }

        const {width: ITEM_WIDTH, left: FIRST_CHILD_LEFT, top: FIRST_ITEM_TOP} = firstItem.getBoundingClientRect()
        const SECOND_CHILD_LEFT = secondItem.getBoundingClientRect().left;
        const GAP_WIDTH = SECOND_CHILD_LEFT - ITEM_WIDTH - FIRST_CHILD_LEFT
        setMarginTop(FIRST_ITEM_TOP)

        const {width: CONTAINER_WIDTH} = renderedItemsContainer.current!.getBoundingClientRect()
        const containerStyle = window.getComputedStyle(renderedItemsContainer.current!)
        const getStyleValueAsInt = (property: string) => parseInt(containerStyle.getPropertyValue(property))
        const CONTAINER_PADDING_LEFT = getStyleValueAsInt('padding-left');
        const CONTAINER_PADDING_RIGHT = getStyleValueAsInt('padding-right');
        const CONTAINER_INNER_WIDTH = CONTAINER_WIDTH - CONTAINER_PADDING_LEFT - CONTAINER_PADDING_RIGHT

        const SAFE_COLUMN_COUNT = Math.floor(CONTAINER_INNER_WIDTH / (ITEM_WIDTH + GAP_WIDTH))
        const SAFE_COLUMNS_WIDTH = Math.floor(SAFE_COLUMN_COUNT) * (ITEM_WIDTH + GAP_WIDTH)

        if (SAFE_COLUMNS_WIDTH + ITEM_WIDTH < CONTAINER_INNER_WIDTH) {
            setColumnCount(SAFE_COLUMN_COUNT + 1)
        } else {
            setColumnCount(SAFE_COLUMN_COUNT)
        }

        setMeasureStatus(MeasureStatus.RowHeight)
    }, [])

    const measureRowHeight = useCallback(() => {
        const firstItem = renderedItemsContainer.current!.firstChild
        if (!firstItem) return

        const lastItem = renderedItemsContainer.current!.children[columnCount]
        if (!lastItem) return

        if (!isElementNode(firstItem) || !isElementNode(lastItem)) {
            throw new Error('Nodes must be of type Element!')
        }

        const FIRST_ITEM_TOP = firstItem.getBoundingClientRect().top
        const LAST_ITEM_TOP = lastItem.getBoundingClientRect().top
        setRowHeight(LAST_ITEM_TOP - FIRST_ITEM_TOP)

        setMeasureStatus(MeasureStatus.Done)
    }, [columnCount])

    useEffect(() => {
        if (measureStatus === MeasureStatus.Done) return
        measureStatus === MeasureStatus.ColumnCount && measureColumnCount()
        measureStatus === MeasureStatus.RowHeight && measureRowHeight()
    }, [props.items, measureStatus])

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
        }, 100 )
    }, [columnCount, marginTop, props.items.length, props.tolerance, rowHeight])

    useEffect(() => {
        if (measureStatus !== MeasureStatus.Done) return

        document.addEventListener('scroll', scrollCallback)
        return () => document.removeEventListener('scroll', scrollCallback)
    }, [measureStatus, rowHeight])

    const itemsToRender = useMemo(() => {
        if (measureStatus === MeasureStatus.ColumnCount) return props.items.slice(0, 2)
        if (measureStatus === MeasureStatus.RowHeight) return props.items.slice(0, columnCount + 1)

        const TOTAL_ROW_COUNT = Math.ceil(props.items.length / columnCount)
        const LAST_RENDERED_ROW_NUMBER = TOTAL_ROW_COUNT - virtualRowCount.bottom
        const START_INDEX = virtualRowCount.top * columnCount
        const END_INDEX = Math.min(props.items.length, LAST_RENDERED_ROW_NUMBER * columnCount)
        return props.items.slice(START_INDEX, END_INDEX)
    }, [virtualRowCount, columnCount, props.items, measureStatus])

    return (
        <div>
            <div ref={virtualSpacerTop}/>
            <div ref={renderedItemsContainer} className={props.className}>
                {itemsToRender.map((item, index) => props.renderItem(item, index))}
            </div>
            <div ref={virtualSpacerBottom}/>
        </div>
    )
}

export default VirtualScroll
