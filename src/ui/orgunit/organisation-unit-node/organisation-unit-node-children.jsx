import PropTypes from 'prop-types'
import React from 'react'
import { isPathIncluded } from '../helpers'
import { orgUnitPathPropType } from '../prop-types'
import { LoadingSpinner } from './loading-spinner'
import { useOrgChildren } from './use-org-children'

const getFilteredChildren = ({ orgChildren, filter, node }) => {
    if (!filter?.length) {
        return orgChildren
    }

    return orgChildren.filter((child) => {
        return isPathIncluded(filter, `${node.path}/${child.id}`)
    })
}

export const OrganisationUnitNodeChildren = ({
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
    OrganisationUnitNode,
}) => {
    const orgChildren = useOrgChildren({
        node,
        isUserDataViewFallback,
        suppressAlphabeticalSorting,
        onComplete: onChildrenLoaded,
    })

    const displayChildren =
        orgChildren.called && !orgChildren.loading && !orgChildren.error
    const filteredChildren = displayChildren
        ? getFilteredChildren({ orgChildren: orgChildren.data, filter, node })
        : []

    return (
        <>
            {orgChildren.loading && <LoadingSpinner />}
            {orgChildren.error && `Error: ${orgChildren.error}`}
            {displayChildren &&
                !filteredChildren.length &&
                ('No children match filter')}

            {!!filteredChildren.length &&
                filteredChildren.map((child) => {
                    const childPath = `${parentPath}/${child.id}`

                    return (
                        <OrganisationUnitNode
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
                        />
                    )
                })}
        </>
    )
}

OrganisationUnitNodeChildren.propTypes = {
    // Prevent cirular imports
    OrganisationUnitNode: PropTypes.func.isRequired,
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
