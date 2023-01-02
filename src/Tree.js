import React from 'react'
//import { Node, CircularLoader } from '@dhis2/ui-core'
import { makeStyles } from '@material-ui/core/styles';
import { getOrgUnitTree, getOrgUnitTreeChildren } from './OrgUnitTree';
import { useDataQuery, CustomDataProvider } from '@dhis2/app-runtime';
import { OrganisationUnitTree } from '@dhis2/ui';
import isEmpty from 'lodash/isEmpty';

const useStyles = makeStyles({
    root:{
        borderRadius: 4,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        color: '#000000'
    },
    loader:{
        marginLeft: 'auto !important',
        marginRight: 'auto !important'
    }
});

const meQuery = {
    roots: {
        resource: 'me',
        params: {
            order: 'displayName:asc',
            fields: 'dataViewOrganisationUnits[id,path,displayName,children[id,path,displayName,children]]',
            paging: 'false',
        },
    },
}
const ouQuery = {
    orgUnits: {
        resource: 'organisationUnits',
        id: ({ id }) => `${id}`,
        params:{
            fields: 'id,displayName,path,parent,children[id,displayName,children,path,parent]',
            paging: 'false'
        }
    }
}

const onChange =  (selected, setSelected, singleSelection) => ({
    id,
    path,
    checked,
}) => {
    console.log('onChange', { path, id, checked })
    const pathIndex = selected.indexOf(path)

    if (checked) {
        setSelected(singleSelection ? [path] : [...selected, path])
    } else {
        setSelected(
            singleSelection
                ? []
                : [
                      ...selected.slice(0, pathIndex),
                      ...selected.slice(pathIndex + 1),
                  ]
        )
    }
}

const createRootObject=(root)=>{
    const hieTree = {};
    const ous = root.map((rt)=>{        
           return hieTree[`organisationUnits/${rt.id}`] = rt;
    }) 
    return hieTree;   
}
const pathToId = path => {
    const pathSplit = path.split('/')
    const orgId = pathSplit[pathSplit.length - 1]
    return orgId
}
export const Tree = (props) => {
    const { loading,data, engine } = useDataQuery(meQuery);
    const [selected, setSelected] = React.useState([])
    const [roots, setRoots] = React.useState([])
    const rootIds = getOrgUnitTree(data);
    const onExpand = ({ path }) => {
        const orgId = pathToId(path);
        engine.query(ouQuery, {
            variables: {
                id: orgId,
            },
            onComplete: data => {
                //setChildrenFor(path, data.orgUnits.children)
                const tree = getOrgUnitTreeChildren(rootIds,data.orgUnits.children);
                console.log("tree",tree, "data",data, "roots",roots)
                setRoots(
                    ...roots,
                    tree
                );                
            },
            onError: error => {
                //setError(error)
                console.error('OrgUnitTree onOpen error: ', error)
            },
        })
    }
    React.useEffect(()=>{
        if(!loading){
            if(data){
                setRoots(createRootObject(data.roots.dataViewOrganisationUnits))
            }            
        }
    },[loading,data])
    return (
        <section>
            {   
                
                <CustomDataProvider
                    data={
                        !isEmpty(roots)?roots:null
                    }
                >
                    {
                        !isEmpty(roots)?
                        (
                            <OrganisationUnitTree
                                onChange={ onChange(selected, setSelected, props.singleSelection) }
                                roots= { rootIds }
                                selected= { selected }
                                onExpand = { onExpand }
                                { ...props }
                            />
                        ):null
                    }
                </CustomDataProvider>
               
            }
        </section>
    )
}