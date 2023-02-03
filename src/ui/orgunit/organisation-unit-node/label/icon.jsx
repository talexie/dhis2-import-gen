import PropTypes from 'prop-types'
import React from 'react'
import { IconEmpty } from './icon-empty'
import { IconFolderClosed } from './icon-folder-closed'
import { IconFolderOpen } from './icon-folder-open'
import { IconSingle } from './icon-single'

/**
 * @param {Object} props
 * @param {bool} props.hasChildren
 * @param {bool} props.open
 * @returns {React.Component}
 */
export const Icon = ({ loading, hasChildren, open }) => {
    if (loading) {
        return <IconEmpty />
    }

    if (!hasChildren) {
        return <IconSingle />
    }

    if (open) {
        return <IconFolderOpen />
    }

    return <IconFolderClosed />
}

Icon.propTypes = {
    hasChildren: PropTypes.bool,
    loading: PropTypes.bool,
    open: PropTypes.bool,
}
