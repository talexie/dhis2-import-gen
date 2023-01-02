import isUndefined from 'lodash/isUndefined';

export const getOrgUnitTree = (data) => {
    
    let rootIds = [];
    if(!isUndefined(data))
    {
        rootIds = data.roots.dataViewOrganisationUnits.map(ou => ou.id); 
        return rootIds;  
        
    }
    return rootIds;
}

export const getOrgUnitTreeChildren = (rootIds,data) => {
    let tree = [];
    if(!isUndefined(data))
    {  
        const allOrgUnits = data.filter(ou =>
            rootIds.some(r => ou.path.includes(r)));
        tree = allOrgUnits.filter(ou => rootIds.some(r => ou.id === r))

        tree.forEach(root => {
            const setChildren = parent => {
                parent.children = allOrgUnits.filter(ou =>
                    parent.children.some(c => c.id === ou.id)
                )
                parent.children.forEach(c => setChildren(c))
            }
            setChildren(root);
        })
    }
    return tree
}