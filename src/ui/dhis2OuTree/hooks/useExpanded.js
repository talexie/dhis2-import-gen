import { useState } from 'react'
import { 
    createExpandHandlers,
    getAllExpandedPaths
} from '../util';

/**
 * @param {string[]} initiallyExpanded
 * @param {Function} [onExpand]
 * @param {Function} [onCollapse]
 * @returns {{ expanded[], handleExpand: Function, handleCollapse: Function }}
 */
export const useExpanded = ({
    initiallyExpanded,
    onExpand,
    onCollapse,
    expandedControlled,
    handleExpandControlled,
    handleCollapseControlled,
}) => {
    const isControlled = !!expandedControlled
    const allInitiallyExpandedPaths = isControlled
        ? []
        : getAllExpandedPaths(initiallyExpanded)

    const [expanded, setExpanded] = useState(allInitiallyExpandedPaths)

    if (isControlled) {
        return {
            expanded: expandedControlled,
            handleExpand: handleExpandControlled,
            handleCollapse: handleCollapseControlled,
        }
    }

    const { handleExpand, handleCollapse } = createExpandHandlers({
        expanded,
        setExpanded,
        onExpand,
        onCollapse,
    })

    return { expanded, handleExpand, handleCollapse }
}