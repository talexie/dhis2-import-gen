import { isPathIncluded } from '../helpers'

export const filterRootIds = (filter, rootIds) => {
    if (!filter?.length) {
        return rootIds
    }

    return rootIds.filter((rootId) => isPathIncluded(filter, `/${rootId}`))
}
