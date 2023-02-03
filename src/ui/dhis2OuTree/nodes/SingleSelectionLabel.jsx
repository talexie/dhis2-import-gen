import * as React from 'react';
import { css } from '@emotion/react';

const choice=css`
    background: transparent;
    border-radius: 3px;
    cursor: pointer;
    display: inline-block;
    font-size: 14px;
    line-height: 24px;
    padding: 0 5px;
    user-select: none;
    white-space: nowrap;
    .checked {
        color: white;
    }
    .loading {
        cursor: auto;
    }`;
/**
 * @param {Object} props
 * @param {string} props.label
 * @param {bool} [props.checked]
 * @param {bool} [props.loading]
 * @param {Function} [props.onChange]
 * @returns {React.Component}
 */
export const SingleSelectionLabel = ({
    checked,
    children,
    onChange,
    loading
}) => (
    <span
        onClick={(event) => {
            const payload = { checked: !checked }
            onChange(payload, event)
        }}
        css={[choice,checked, loading ]}
    >
        {children}
    </span>
)
/*
SingleSelectionLabel.propTypes = {
    children: PropTypes.any.isRequired,
    checked: PropTypes.bool,
    loading: PropTypes.bool,
    onChange: PropTypes.func,
}
*/
