import { Checkbox } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon } from './icon'

export const IconizedCheckbox = ({
    checked,
    hasChildren,
    indeterminate,
    children,
    loading,
    name,
    open,
    value,
    onChange,
}) => {
    const icon = (
        <Icon
            loading={loading}
            open={open}
            hasChildren={hasChildren}
        />
    )

    const checkboxLabel = (
        <>
            <span>{icon}</span>
            {children}

            <style jsx>{`
                span {
                    display: inline-block;
                    margin-right: 4px;
                }
            `}</style>
        </>
    )

    return (
        <>
            <Checkbox
                dense
                checked={checked}
                name={name}
                value={value}
                label={checkboxLabel}
                indeterminate={indeterminate}
                onChange={onChange}
            />
        </>
    )
}

IconizedCheckbox.propTypes = {
    checked: PropTypes.bool.isRequired,
    children: PropTypes.any.isRequired,
    hasChildren: PropTypes.bool.isRequired,
    indeterminate: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}
