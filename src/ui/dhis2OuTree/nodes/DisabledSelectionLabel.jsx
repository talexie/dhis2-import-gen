import * as React from 'react';
import { SingleSelectionLabel } from './SingleSelectionLabel';

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {Function} props.onToggleOpen
 * @param {bool} [props.loading]
 * @returns {React.Component}
 */
export const DisabledSelectionLabel = ({ children, loading, onToggleOpen }) => (
    <SingleSelectionLabel
        checked={false}
        loading={loading}
        onChange={onToggleOpen}
    >
        {children}
    </SingleSelectionLabel>
)
