import { useMemo } from 'react';
import { patchMissingDisplayName } from '../util';
import { useQuery } from 'react-query';
import isEmpty from 'lodash/isEmpty';

export const createRootQuery = (ids) =>
    ids.reduce(
        (query, id) => ({
            ...query,
            [id]: {
                id,
                resource: `organisationUnits`,
                params: ({ isUserDataViewFallback }) => ({
                    isUserDataViewFallback,
                    fields: ['displayName', 'path', 'id','level'],
                }),
            },
        }),
        {}
    )

/**
 * @param {string[]} ids
 * @param {Object} [options]
 * @param {boolean} [options.withChildren]
 * @param {boolean} [options.isUserDataViewFallback]
 * @returns {Object}    
 */
export const useRootOrgData = (ids, { isUserDataViewFallback } = {}) => {
    const query = createRootQuery(ids);
    const filterQuery = Object.keys(query);
    const url = !isEmpty(filterQuery)?[`organisationUnits?filter=id:in:[${filterQuery?.join(',')}]&isUserDataViewFallback=${ isUserDataViewFallback??true}&paging=false&fields=path,id,displayName,level`]:false;
    const rootOrgUnits = useQuery(url, {
        enabled: (url !== false)
    })
    const { isLoading:loading, error, data, refetch } = rootOrgUnits

    const patchedData = useMemo(() => {
        return data?.organisationUnits ? patchMissingDisplayName(data?.organisationUnits) : data?.organisationUnits
    }, [data?.organisationUnits])

    return {
        loading,
        error: error || null,
        data: patchedData || null,
        refetch
    }
}