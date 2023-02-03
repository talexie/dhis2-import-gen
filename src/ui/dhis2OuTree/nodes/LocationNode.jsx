import * as React from 'react';
import PropTypes from 'prop-types';
import { 
    orgUnitPathPropType,
    leftTrimToRootId,
    hasDescendantSelectedPaths  
} from '../util';
import { ErrorMessage } from './ErrorMessage';
import { Label } from './Label';
import { RootLoading } from '../RootLoading';
import { LocationNodeChildren } from './LocationNodeChildren';
import { useOpenState,useOrgData  } from '../hooks';
import { LabelNode } from './LabelNode';

export const LocationNode = ({
    autoExpandLoadingError,
    disableSelection,
    displayName,
    expanded,
    highlighted,
    id,
    isUserDataViewFallback,
    path,
    renderNodeLabel,
    rootId,
    selected,
    singleSelection,
    filter,
    suppressAlphabeticalSorting,
    onChange,
    onChildrenLoaded,
    onCollapse,
    onExpand,
    getNode,
    filterQuery,
    maxLevel
}) => {
    const orgData = useOrgData(id, 
        {
            isUserDataViewFallback,
            displayName,
        },
         filterQuery
    );
    const strippedPath = leftTrimToRootId(path, rootId)
    const node = {
        // guarantee that displayName and id are avaiable before data loaded
        displayName,
        id,
        ...(orgData.data || {}),
        // do not override strippedPath with path from loaded data
        path: strippedPath,
        label: displayName
    }
    const hasChildren = !!node.children && node.children > 0;

    const hasSelectedDescendants = hasDescendantSelectedPaths(
        strippedPath,
        selected,
        //rootId
    )
    const isHighlighted = highlighted.includes(path)
    const { open, onToggleOpen } = useOpenState({
        autoExpandLoadingError,
        errorMessage: orgData.error && orgData.error.toString(),
        path: strippedPath,
        expanded,
        onExpand,
        onCollapse,
    })

    const isSelected = !!selected.find((curPath) =>
        curPath.match(new RegExp(`${strippedPath}$`))
    )

    const labelContent = renderNodeLabel({
        disableSelection,
        hasChildren,
        hasSelectedDescendants,
        loading: orgData.loading,
        error: orgData.error,
        selected,
        open,
        path,
        singleSelection,
        node,
        label: displayName,
        checked: isSelected,
        highlighted: isHighlighted,
    })

    const label = (
        <Label
            node={node}
            fullPath={path}
            open={open}
            loading={orgData.loading}
            checked={isSelected}
            rootId={rootId}
            onChange={onChange}
            selected={selected}
            hasChildren={hasChildren}
            highlighted={isHighlighted}
            onToggleOpen={onToggleOpen}
            disableSelection={disableSelection}
            singleSelection={singleSelection}
            hasSelectedDescendants={hasSelectedDescendants}
            getNode = { getNode }
        >
            {labelContent}
        </Label>
    )

    /**
     * No children means no arrow, therefore we have to provide something.
     * While "loading" is true, "hasChildren" is false
     * There are some possible children variants as content of this node:
     *
     * 1. Nothing; There are no children
     * 2. Placeholder: There are children, but the Node is closed (show arrow)
     * 3. Error: There are children and loading information somehow failed
     * 4. Child nodes: There are children and the node is open
     */
    const showPlaceholder = hasChildren && !open && !orgData.error
    const showChildNodes = hasChildren && open && !orgData.error

    return (
        <LabelNode
            open={open}
            onOpen={onToggleOpen}
            onClose={onToggleOpen}
            component={label}
            icon={orgData.loading && <RootLoading />}
        >
            {orgData.error && (
                <ErrorMessage>
                    { 'Could not load children' }
                </ErrorMessage>
            )}
            {showPlaceholder && <span/>}
            {showChildNodes && (
                <LocationNodeChildren
                    // Prevent cirular imports
                    LocationNode={LocationNode}
                    node={node}
                    autoExpandLoadingError={autoExpandLoadingError}
                    disableSelection={disableSelection}
                    expanded={expanded}
                    filter={filter}
                    highlighted={highlighted}
                    isUserDataViewFallback={isUserDataViewFallback}
                    onChange={onChange}
                    onChildrenLoaded={onChildrenLoaded}
                    onCollapse={onCollapse}
                    onExpand={onExpand}
                    parentPath={path}
                    renderNodeLabel={renderNodeLabel}
                    rootId={rootId}
                    selected={selected}
                    singleSelection={singleSelection}
                    suppressAlphabeticalSorting={suppressAlphabeticalSorting}
                    getNode ={ getNode }
                    filterQuery ={filterQuery }
                    maxLevel = { maxLevel }
                />
            )}
        </LabelNode>
    )
}

LocationNode.propTypes = {
    id: PropTypes.string.isRequired,
    renderNodeLabel: PropTypes.func.isRequired,
    rootId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    autoExpandLoadingError: PropTypes.bool,
    disableSelection: PropTypes.bool,
    displayName: PropTypes.string,
    expanded: PropTypes.arrayOf(orgUnitPathPropType),
    filter: PropTypes.arrayOf(orgUnitPathPropType),
    highlighted: PropTypes.arrayOf(orgUnitPathPropType),
    isUserDataViewFallback: PropTypes.bool,
    path: orgUnitPathPropType,
    selected: PropTypes.arrayOf(orgUnitPathPropType),
    singleSelection: PropTypes.bool,
    suppressAlphabeticalSorting: PropTypes.bool,
    onChildrenLoaded: PropTypes.func,
    onCollapse: PropTypes.func,
    onExpand: PropTypes.func,
}