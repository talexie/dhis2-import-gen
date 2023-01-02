import React, { useState, useCallback,useEffect } from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { useDataQuery } from '@dhis2/app-runtime'
import { CircularLoader } from '@dhis2/ui'

import { pathToId } from '../Utils';
import { FormField } from '../forms/FormField';
import { TreeNode } from './TreeNode';
import { makeStyles } from '@material-ui/styles';
import map from 'lodash/map';

const useStyles = makeStyles({
    container: {
        marginBottom: 15
    }
});

const rootQuery = {
    roots: {
        resource: 'me',
        params: {
            fields: 'dataViewOrganisationUnits[id,path,displayName,children::isNotEmpty]',
            paging: 'false',
        },
    },
}

const orgQuery = {
    units: {
        resource: 'organisationUnits',
        id: ({ id }) => `${id}`,
        params: {
            fields: 'children[id,displayName,path,children::isNotEmpty]',
            paging: 'false',
        },
    },
}
/**
 * Organisation Unit tree component
 * @param {*} param0 
 */
const OrgUnitTree2 = (props) => {
    const {
        label,
        dataTest,
        multiSelect=false,
        getSelected
    } = props;
    const classes = useStyles();
    const [children, setChildren] = useState([]);
    const [selected, setSelected] = useState([]);
    const [error, setError] = useState(undefined);
    const { loading, data,error: rootError,engine } = useDataQuery(rootQuery);
    const getRoots =useCallback(()=>{
        if(rootError){
            setError(rootError)
            console.error('OrgUnitTree error: ', rootError);
        }
        else if(data){
            const roots = data.roots.dataViewOrganisationUnits;
            const list = formatList(roots);
            setChildren(t=>list);
        }
        else{
            // Handle loading
        }

    },[rootError,data]);
    const formatList = list => {
        return map(list,({ id, path, displayName, children }) => ({
            open: false,
            id: id,
            value: path,
            path: path,
            label: displayName,
            children: [],
            hasChildren: children,
        }))
    }

    const toggleOpenStatus = path => {
        const hierarchy = path.split('/').filter(p => p.length !== 0)
        const newChildren = [...children]
        let target = newChildren
        hierarchy.forEach(parent => {
            if(target === undefined){
                target = [...newChildren];
            }                     
            target = target?.find(el => el.id === parent);
            
            if (target?.value === path) {
                target.open = !target.open
            } 
            else {
                target = target.children
            }
        })
        setChildren(tchild=>newChildren)
    }

    const setChildrenFor = (path, ch) => {
        const list = formatList(ch)
        list.sort((a, b) => a.label.localeCompare(b.label))
        const hierarchy = path.split('/').filter(p => p.length !== 0)
        //const hierarchy = path.split('/')[ path.split('/').length-1]
        const newChildren = [...children]
        let target = newChildren
        hierarchy.forEach(parent => {  
            if(target === undefined){
                target = [...newChildren];
            } 
            target = target?.find(el =>el.id === parent);
            if (target?.value === path) {
                target.children = list
                target.open = true
            } 
            else {
                target = target?.children
            }              
            
        })
        setChildren(tchild=>newChildren);
    }

    const onOpen = (path, ch) => {
        if (ch.length === 0) {
            const orgId = pathToId(path)
            engine.query(orgQuery, {
                variables: {
                    id: orgId,
                },
                onComplete: data => {
                    setChildrenFor(path, data.units.children)
                },
                onError: error => {
                    setError(error)
                    console.error('OrgUnitTree onOpen error: ', error)
                },
            })
        } else {
            toggleOpenStatus(path)
        }
    }

    const onClose = path => {
        toggleOpenStatus(path);
    }

    const onSelect = path => {
        if (multiSelect) {
            const newValue = !selected.includes(path)
            if (newValue === false) {
                setSelected(selected.filter(p => p !== path))
                
            } else {
                setSelected([...selected, path])
                
            }
        } 
        else {
            setSelected([path]);
            
        }
        getSelected([path]);
    }

    useEffect(()=>{
        getRoots();
    },[getRoots])
    const showTree = !loading && !error

    return (
        <FormField label={label} dataTest={dataTest}>
            <div className={classes.container}>
                {loading && <CircularLoader dataTest={`${dataTest}-loading`} />}
                {error && (
                    <div data-test={`${dataTest}-error`}>
                        <p>
                            {i18n.t(
                                'Loading the organisation units failed!'
                            )}
                        </p>
                        <p>{error.message}</p>
                    </div>
                )}
                {showTree && (
                    //map(roots,(root)=>{
                        
                        //return (
                            <TreeNode
                                {...props}
                                selected={ selected }
                                select={ onSelect }
                                multiSelect={ multiSelect } 
                                onOpen={onOpen}
                                onClose={onClose}
                                list={ children }
                                dataTest={`${dataTest}-tree`}
                            />
                        //)
                    //}) 
                )}
            </div>
        </FormField>
    )
}

OrgUnitTree2.propTypes = {
    label: PropTypes.string.isRequired,
    multiSelect: PropTypes.bool,
}

export { OrgUnitTree2 }