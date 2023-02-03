import * as React from 'react';
import { IconFolderClosed } from './IconFolderClosed';
import { IconFolderOpen } from './IconFolderOpen';
import { IconEmpty } from './IconEmpty';
import { IconSingle } from './IconSingle';


/**
 * @param {Object} props
 * @param {bool} props.hasChildren
 * @param {bool} props.open
 * @returns {React.Component}
 */
export const Icon = ({ loading, hasChildren, open }) => {
    if (loading) {
        return <IconEmpty/>
    }

    if (!hasChildren) {
        return <IconSingle/>
    }

    if (open) {
        return <IconFolderOpen/>
    }

    return <IconFolderClosed />
}