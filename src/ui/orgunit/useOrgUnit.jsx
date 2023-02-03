import { useState } from 'react'

export const useOrgUnit = () => {
    const [organisationUnitId, setOrganisationUnitId] = useState(null);
    
    const handleDataSetsChange = (value) => {
        const { selected } = value;
        console.log("selected:",value);
        setOrganisationUnitId(selected)
    }

    return {
        organisationUnitId:organisationUnitId,
        handleOrganisationUnitChange: handleDataSetsChange
    }
}