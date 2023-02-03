import * as React from 'react';
import PropTypes from 'prop-types';
import { 
    isPathIncluded,
    orgUnitPathPropType
 } from '../util';
import { RootLoading } from '../RootLoading';
import { useOrgChildren } from '../hooks';

const getFilteredChildren = ({ orgChildren, filter, node }) => {
    if (!filter?.length) {
        return orgChildren
    }

    return orgChildren.filter((child) => {
        return isPathIncluded(filter, `${node.path}/${child.id}`)
    })
}

export const LocationNodeChildren = ({
    node,
    autoExpandLoadingError,
    disableSelection,
    expanded,
    filter,
    highlighted,
    isUserDataViewFallback,
    onChange,
    onChildrenLoaded,
    onCollapse,
    onExpand,
    parentPath,
    renderNodeLabel,
    rootId,
    selected,
    singleSelection,
    suppressAlphabeticalSorting,
    LocationNode,
    getNode,
    filterQuery,
    maxLevel 
}) => {
    const orgChildren = useOrgChildren({
        node,
        isUserDataViewFallback,
        suppressAlphabeticalSorting,
        onComplete: onChildrenLoaded,
    })

    const displayChildren =
        !orgChildren.loading && !orgChildren.error
    const filteredChildren = displayChildren
        ? getFilteredChildren({ orgChildren: orgChildren.data, filter, node })
        : []

    return (
        <>
            {orgChildren.loading && <RootLoading />}
            {orgChildren.error && `Error: ${orgChildren.error}`}
            {displayChildren &&
                !filteredChildren.length &&
                'No children match filter'}

            {!!filteredChildren.length &&
                filteredChildren.map((child) => {
                    const childPath = `${parentPath}/${child.id}`

                    return (
                        <LocationNode
                            autoExpandLoadingError={autoExpandLoadingError}
                            disableSelection={disableSelection}
                            displayName={child.displayName}
                            expanded={expanded}
                            filter={filter}
                            highlighted={highlighted}
                            id={child.id}
                            isUserDataViewFallback={isUserDataViewFallback}
                            key={childPath}
                            onChange={onChange}
                            onChildrenLoaded={onChildrenLoaded}
                            onCollapse={onCollapse}
                            onExpand={onExpand}
                            path={childPath}
                            renderNodeLabel={renderNodeLabel}
                            rootId={rootId}
                            selected={selected}
                            singleSelection={singleSelection}
                            suppressAlphabeticalSorting={
                                suppressAlphabeticalSorting
                            }
                            getNode ={ getNode }
                            filterQuery = { filterQuery }
                            maxLevel = { maxLevel}
                        />
                    )
                })}
        </>
    )
}

LocationNodeChildren.propTypes = {
    // Prevent cirular imports
    LocationNode: PropTypes.func.isRequired,
    node: PropTypes.object.isRequired,
    parentPath: PropTypes.string.isRequired,
    renderNodeLabel: PropTypes.func.isRequired,
    rootId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,

    autoExpandLoadingError: PropTypes.bool,
    disableSelection: PropTypes.bool,
    expanded: PropTypes.arrayOf(orgUnitPathPropType),
    filter: PropTypes.arrayOf(orgUnitPathPropType),
    highlighted: PropTypes.arrayOf(orgUnitPathPropType),
    isUserDataViewFallback: PropTypes.bool,
    selected: PropTypes.arrayOf(orgUnitPathPropType),
    singleSelection: PropTypes.bool,
    suppressAlphabeticalSorting: PropTypes.bool,

    onChildrenLoaded: PropTypes.func,
    onCollapse: PropTypes.func,
    onExpand: PropTypes.func,
}