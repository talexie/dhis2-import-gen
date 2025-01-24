import { useMemo } from 'react'
import { useQuery } from 'react-query'
import { patchMissingDisplayName } from './patch-missing-display-name';
import { isEmpty } from 'lodash';
import { defaultQueryFn } from '../../../../App2';

export const createRootQuery = (ids) =>
    ids.reduce(
        (query, id) => ({
            ...query,
            [id]: {
                id,
                resource: `organisationUnits`,
                params: ({ isUserDataViewFallback }) => ({
                    isUserDataViewFallback,
                    fields: ['displayName', 'path', 'id'],
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
    const variables = { isUserDataViewFallback }
    const filterQuery = Object.keys(query);
    const url = !isEmpty(filterQuery)?[`organisationUnits?filter=id:in:[${filterQuery?.join(',')}]&isUserDataViewFallback=${ isUserDataViewFallback??true}&paging=false&fields=path,id,displayName`]:false;
    const rootOrgUnits = useQuery( {
        queryKey: url,
        queryFn: defaultQueryFn,
        enabled: (url !== false)
    })
    const { isFetched:called, isLoading:loading, error, data, refetch } = rootOrgUnits

    const patchedData = useMemo(() => {
        return data?.organisationUnits ? patchMissingDisplayName(data?.organisationUnits) : data?.organisationUnits
    }, [data?.organisationUnits])

    return {
        called,
        loading,
        error: error || null,
        data: patchedData || null,
        refetch,
    }
}
