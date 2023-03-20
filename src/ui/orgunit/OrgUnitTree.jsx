
import i18n from '@dhis2/d2-i18n';
import { OrganisationUnitTree } from './organisation-unit-tree';
import { CircularLoader, Help } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery } from 'react-query';
import queryString from 'query-string';
import { css } from '@emotion/react';

const classes={
    wrapper: css({
        maxHeight: 'calc(60vh - 154px)',
        minHeight: 'calc(300px - 154px)',
        overflowY: 'auto',
        paddingTop: '8px',
        paddingBottom: '8px'
    })
}
const allRootQuery = {
    allRoots: {
        resource: 'organisationUnits',
        params: {
            filter: 'level:eq:1',
            fields: 'id,path,displayName,level',
            paging: 'false',
        },
    },
}

const query = {
    data: {
        resource: 'me',
        params: {
            fields: 'organisationUnits[id,path,displayName,level], authorities',
        },
    },
}

export const useUserOrganisationUnits = () => {
    const { isLoading, data, error } = useQuery([`${query.data.resource}?${queryString.stringify(query.data.params)}`])
    
    const {
        isLoading: loadingAll,
        data: dataAll,
        error: errorAll,
        refetch,
    } = useQuery([`${allRootQuery.allRoots.resource}?${queryString.stringify(allRootQuery.allRoots.params)}`], { lazy: true })
    useEffect(() => {
        if (!data?.organisationUnits.length && data?.authorities.includes('ALL')) 
        {
            //fetch all orgs
            refetch()
        }
    }, [data])

    return {
        loading: data?.authorities.includes('ALL')?loadingAll:isLoading,
        organisationUnits: data?.authorities.includes('ALL')?dataAll?.organisationUnits: data?.organisationUnits,
        error: data?.authorities.includes('ALL')? errorAll : error,
    }
}

export const AvailableOrganisationUnitsTree = React.memo(({ multiselect = false, onChange, getSelected, onBlur=()=>{} }) => {
    const [selected, setSelected] = useState(new Map());
    const { loading, organisationUnits, error } = useUserOrganisationUnits();
    const [selectedOrgUnits, setSelectedOrgUnits] = useState([])

    const [expanded, setExpanded] = useState([]);

    const handleExpand = useCallback(
        ({ path }) => {
            if (!expanded.includes(path)) {
                setExpanded([...expanded, path])
            }
        },
        [expanded, setExpanded]
    )

    const handleCollapse = useCallback(
        ({ path }) => {
            const pathIndex = expanded.indexOf(path)

            if (pathIndex !== -1) {
                const updatedExpanded =
                    pathIndex === 0
                        ? expanded.slice(1)
                        : [
                            ...expanded.slice(0, pathIndex),
                            ...expanded.slice(pathIndex + 1),
                        ]

                setExpanded(updatedExpanded)
            }
        },
        [expanded, setExpanded]
    )
    const update = useCallback(
        (nextOrgUnits, nextExpanded) => {
            if (onChange) {
                onChange(nextOrgUnits.map((unit) => unit.id))
                // Also call onBlur if this is available. In a redux-form the component will be 'touched' by it
               onBlur && onBlur()
            }

            setSelectedOrgUnits(nextOrgUnits)

            if (nextExpanded) {
                setExpanded(nextExpanded)
            }
        },
        [onChange, onBlur, setSelectedOrgUnits, setExpanded]
    )

    const toggleSelectedOrgUnits = useCallback(
        ({ id, path, displayName }) => {
            const orgUnitIndex = selectedOrgUnits.findIndex((u) => u.id === id)
            const nextOrgUnits =
                orgUnitIndex === -1
                    ? [...selectedOrgUnits, { id, path, displayName }]
                    : [
                          ...selectedOrgUnits.slice(0, orgUnitIndex),
                          ...selectedOrgUnits.slice(orgUnitIndex + 1),
                      ]

            update(nextOrgUnits)
        },
        [selectedOrgUnits, update]
    )


    const selectedOrgUnitPaths = useMemo(
        () => selectedOrgUnits.map(({ path }) => path),
        [selectedOrgUnits]
    )

    if (loading) {
        return (
            <div css={classes.wrapper}>
                <CircularLoader />
            </div>
        )
    }

    if (error) {
        return (
            <div css={classes.wrapper}>
                <Help error>
                    {i18n.t(
                        'Something went wrong whilst loading your organisation units.'
                    )}
                </Help>
            </div>
        )
    }

    if (organisationUnits?.length === 0) {
        return (
            <div css={classes.wrapper}>
                <p>{i18n.t('You do not have access to any organisation units.')}</p>
            </div>
        )
    }

    const handleOrgUnitClickSingle = ({ id, path }) => {
        let selectedId = id
        if (selected.has(path)) {
            //deselect
            selectedId = null
            setSelected(new Map())
        } else {
            setSelected(new Map().set(path, id))
        }
        if (onChange) {
            onChange(selectedId);
            getSelected(selectedId);
        }
    }

    const handleOrgUnitClickMulti = ({ id, path, selected: s }) => {
        const newSelected = new Map(selected)
        if (s.includes(path)) {
            newSelected.set(path, id)
        } else {
            newSelected.delete(path)
        }
        setSelected(newSelected)
        if (onChange) {
            onChange([...newSelected.values()]);
            getSelected([...newSelected.values()]);
        }
    }

    const handleChange = multiselect
        ? handleOrgUnitClickMulti
        : handleOrgUnitClickSingle

    
    return (
        <div css={classes.wrapper}>
            <OrganisationUnitTree
                selected={[...selected.keys()]}
                roots={organisationUnits?organisationUnits:[]}
                singleSelection={!multiselect}
                onChange={handleChange}
                expanded={expanded}
                handleExpand={handleExpand}
                handleCollapse={handleCollapse}
            />
        </div>
    )
})

AvailableOrganisationUnitsTree.propTypes = {
    multiselect: PropTypes.bool,
    onChange: PropTypes.func,
}

export default AvailableOrganisationUnitsTree