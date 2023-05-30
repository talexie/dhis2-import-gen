export const filterRootIds = (filter=[], rootIds=[]) => {
    if (!filter?.length) {
        return rootIds
    }
    return rootIds?.filter((rootId) => isPathIncluded(filter, `/${rootId}`))
}

/**
 * @param {string[]} includedPaths
 * @param {string} path
 * @returns {bool}
 */
 export const isPathIncluded = (includedPaths=[], path) => {
    const isIncluded = includedPaths?.some((includedPath) => {
        if (path === includedPath) {
            return true
        }
        return includedPath.startsWith(`${path}/`)
    })

    return isIncluded
}
export const leftTrimToRootId = (path, rootId) => {
    return path.replace(new RegExp(`^.*(/${rootId})`), '$1')
}

// sort mutates the original
export const sortNodeChildrenAlphabetically = (children) =>
    [...children].sort((left, right) =>
        left.displayName.localeCompare(right.displayName)
    )
/**
 * @template T
 * @param {Array.<T>} arr
 * @returns {Array.<T>}
 */
 const removeDuplicates = (arr) => Array.from(new Set(arr))

 /**
  * @param {string} path
  * @returns {string[]}
  */
 const extractAllPathsFromPath = (path) => {
     // remove leading slash and split by path delimiter/slashes
     const segments = path.replace(/^\//, '').split('/')
 
     const withSubPaths = segments.map((_segment, index) => {
         // take all segments from 0 to index and join them with the delimiter
         return `/${segments.slice(0, index + 1).join('/')}`
     })
 
     return removeDuplicates(withSubPaths)
 }
 
 /**
  * @param {string[]} initiallyExpanded
  * @returns {string[]}
  */
 export const getAllExpandedPaths = (initiallyExpanded) =>
     initiallyExpanded.reduce((all, curPath) => {
         const allPathsInCurPath = extractAllPathsFromPath(curPath)
         return [...all, ...allPathsInCurPath]
     }, [])

/**
 * Note by JGS: I can't recall why this is necessary,
 * but it's there.. So I guess it's better to leave it in for now
 * and investigate why this is necessary in the first place!
 * Maybe we can omit this completely and remove the state from
 * the useRootOrgData hook entirely
 * @TODO: Investigate if this could be removed
 *
 * @param {Object[]} nodes
 * @returns {}
 */
 export const patchMissingDisplayName = (nodes) => {
    const nodeEntries = Object.entries(nodes)
    const nodesWithDisplayName = nodeEntries.map(([id, node]) => {
        const displayName = node.displayName || ''
        return [id, { ...node, displayName }]
    })

    return Object.fromEntries(nodesWithDisplayName)
}
/**
 * Checks wether there are descendants of a path in the
 * array of selected paths
 *
 * @param {string} path
 * @param {string[]} selected
 * @returns {bool}
 */
 export const hasDescendantSelectedPaths = (path, selected) => {
    return selected.some((selectedPath) => {
        const isNotPath = !selectedPath.match(new RegExp(`${path}$`))
        const isSubPath = selectedPath.match(new RegExp(path))
        return isNotPath && isSubPath
    })
}

/**
 * Returns all the childrenIds that should be rendered.
 * An id will be included if it's parent's path + the id is inside
 * the "filter" or the parent's path + id is a substring
 * of the paths in "filter" (then it's a parent path of
 * the units that should be included itself)
 *
 * @param {Object} node
 * @param {Object[]} node.children
 * @param {string[]} includedPaths
 * @returns {string[]}
 */
export const computeChildNodes = (node, filter=[]) => {
    if (!node.children) {
        return []
    }

    if (!filter.length) {
        return node.children
    }

    return node.children.filter((child) => {
        return isPathIncluded(filter, `${node.path}/${child.id}`)
    })
}
/**
 * Get Node paths for roots
 * @param {*} roots 
 * @returns 
 */
export const getRootNodes =(roots=[])=>{
    return roots?.map((root)=>root?.id).filter(Boolean).filter(String);
} 
/**
 * Determine if a certain level is enabled for selection
 * @param level
 * @param selectionLevel
 * @param enabled
 */
export const enableLevelSelection =(level,selectionLevel,enabled)=>{
    if(enabled){
        if( selectionLevel?.includes(level)){
            return false;
        }
        else{
            return true;
        }
    }
    else{
        return false;
    }
}