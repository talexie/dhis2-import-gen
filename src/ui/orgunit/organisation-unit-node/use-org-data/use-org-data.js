import { useQuery } from 'react-query';

const ORG_DATA_QUERY = {
    orgUnit: {
        resource: `organisationUnits`,
        id: ({ id }) => id,
        params: ({ isUserDataViewFallback }) => ({
            isUserDataViewFallback,
            fields: ['path', 'children::size'],
        }),
    },
}

/**
 * @param {string[]} ids
 * @param {Object} options
 * @param {string} options.displayName
 * @param {bool} options.isUserDataViewFallback
 * @returns {Object}
 */
export const useOrgData = (id, { displayName, isUserDataViewFallback }) => {
    if (!displayName) {
        throw new Error('"displayName" is required')
    }
    const url = id?[`organisationUnits/${ id }?paging=false&fields=path,id,displayName,children::size&isUserDataViewFallback=${isUserDataViewFallback??true}`]:false;
    const variables = { id, isUserDataViewFallback }
    const {
        isLoading:loading,
        error,
        data = {},
    } = useQuery(url, {
        enabled: (url !== false)
    })

    return {
        loading,
        error: error || null,
        data: { 
            id, 
            displayName, 
            ...data
        },
    }
}
