/*
 * Derived from DHIS2 work @dhis2/ui
 */
import * as React from 'react';
import { useEffect, useState } from 'react'
import { LocationNode} from './nodes';
import { 
    filterRootIds,
    defaultRenderNodeLabel,
    getRootNodes
} from './util';
import { RootError } from './RootError';
import { RootLoading } from './RootLoading';
import { 
    useForceReload,
    useExpanded,
} from './hooks';

export const LocationTree = ({
    onChange,
    roots,
    autoExpandLoadingError,
    disableSelection,
    forceReload,
    highlighted,
    isUserDataViewFallback,
    initiallyExpanded,
    filter,
    renderNodeLabel,
    selected,
    singleSelection,
    suppressAlphabeticalSorting,
    expanded: expandedControlled,
    handleExpand: handleExpandControlled,
    handleCollapse: handleCollapseControlled,
    onExpand,
    onCollapse,
    onChildrenLoaded,
    error,
    loading,
    getNode,
    filterQuery,
    maxLevel
}) => {
    const rootNodes = getRootNodes(roots??[]);
    const rootIds = filterRootIds(
        filter,
        Array.isArray(rootNodes) ? rootNodes : [rootNodes]
    )
    const reloadId = useForceReload(forceReload)
    const [prevReloadId, setPrevReloadId] = useState(reloadId);

    const { expanded, handleExpand, handleCollapse } = useExpanded({
        initiallyExpanded,
        onExpand,
        onCollapse,
        expandedControlled,
        handleExpandControlled,
        handleCollapseControlled,
    })

    useEffect(() => {
        // do not refetch on initial render
        if (reloadId > 0 && reloadId !== prevReloadId) {
            //refetch()
            setPrevReloadId(reloadId)
        }

        return () =>
            console.warn(
                '@TODO: Why does this component unmount after a force reload?'
            )
    }, [reloadId, prevReloadId])
    return (
        <div>
            {loading && <RootLoading />}
            {error && <RootError error={error} />}
            {!error &&
                !loading &&
                roots.map((rootNode) => {
                    return (
                        <LocationNode
                            key={rootNode.path}
                            rootId={rootNode?.path}
                            autoExpandLoadingError={autoExpandLoadingError}
                            disableSelection={disableSelection}
                            displayName={rootNode?.displayName || ''}
                            expanded={expanded}
                            highlighted={highlighted}
                            id={rootNode?.id}
                            isUserDataViewFallback={isUserDataViewFallback}
                            filter={filter}
                            path={rootNode?.path}
                            renderNodeLabel={renderNodeLabel}
                            selected={selected}
                            singleSelection={singleSelection}
                            suppressAlphabeticalSorting={
                                suppressAlphabeticalSorting
                            }
                            onChange={onChange}
                            onChildrenLoaded={onChildrenLoaded}
                            onCollapse={handleCollapse}
                            onExpand={handleExpand}
                            getNode = { getNode }
                            filterQuery = { filterQuery }
                            maxLevel = { maxLevel }
                        />
                    )
                })}
        </div>
    )
}


LocationTree.defaultProps = {
    filter: [],
    highlighted: [],
    initiallyExpanded: [],
    selected: [],
    renderNodeLabel: defaultRenderNodeLabel,
}
