import { useMemo, useEffect, useRef } from 'react';
import { 
    sortNodeChildrenAlphabetically 
} from '../util';
import { useQuery } from 'react-query';

/**
 * @param {string[]} ids
 * @param {Object} options
 * @param {string} options.displayName
 * @param {boolean} [options.withChildren]
 * @returns {Object}
 */
export const useOrgChildren = ({
    node,
    suppressAlphabeticalSorting,
    onComplete,
}) => {
    const onCompleteCalledRef = useRef(false)
    const url = node.id?[`organisationUnits/${node.id}?paging=false&fields=children[id,path,displayName,level],parent[name]`]:false;
    const { isLoading:loading, error, data } = useQuery(url, {
        enabled: (url !== false)
    })

    const orgChildren = useMemo(() => {
        if (!data) {
            return undefined
        }

        // undefined or zero
        if (!node.children) {
            return []
        }

        return suppressAlphabeticalSorting
            ? data.children
            : sortNodeChildrenAlphabetically(data.children)
    }, [data, suppressAlphabeticalSorting])

    useEffect(() => {
        if (onComplete && orgChildren && !onCompleteCalledRef.current) {
            // For backwards compatibility: Pass entire node incl. children
            onComplete({ ...node, children: orgChildren })
            onCompleteCalledRef.current = true
        }
    }, [onComplete, orgChildren, onCompleteCalledRef])

    return { 
        loading, 
        error: error || null, 
        data: orgChildren 
    }
}